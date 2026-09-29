import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { handler, pathSegments, methodNotAllowed, body, siteUrl, HttpError } from '../lib/http.js'
import { listUpcoming, getSeminarBySlug, publicSeminar, enroll, findEnrollment, publicEnrollment, applyEnrollmentPayment } from '../lib/seminars.js'
import { createCheckout, getPayment, paymentMode } from '../lib/mercadopago.js'
import { SEMINAR_KINDS } from '../shared/seminars.js'

async function startPayment(e, req) {
  const base = siteUrl(req)
  const preference = await createCheckout({
    reference: e.code,
    title: `${SEMINAR_KINDS[e.seminar.kind] || 'Capacitación'}: ${e.seminar.title}`,
    description: `${e.seminar.city} · inscripción ${e.code}`,
    amount: e.amount,
    payerName: e.name,
    payerEmail: e.email,
    returnUrl: `${base}/inscripcion/${e.code}?t=${e.accessToken}`,
    mockUrl: `${base}/pago-simulado?inscripcion=${e.code}&t=${e.accessToken}`,
    expiresAt: e.expiresAt,
    baseUrl: base,
  })
  await prisma.enrollment.update({ where: { id: e.id }, data: { mpPreferenceId: preference.id } })
  return preference.url
}

const tokenBody = z.object({ token: z.string().min(10).max(80) })

// GET  /api/seminars                               -> próximas capacitaciones
// GET  /api/seminars/:slug                         -> detalle
// POST /api/seminars/:slug/enroll                  -> inscribirse (paga o pre-inscribe)
// GET  /api/seminars/inscripcion/:code?t=          -> estado de la inscripción
// POST /api/seminars/inscripcion/:code/pay|confirm|mock-pay
export default handler(async (req, res) => {
  const [first, second, action] = pathSegments(req, /^\/api\/seminars\/?/)

  if (!first) {
    if (req.method !== 'GET') return methodNotAllowed(res)
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60')
    return res.status(200).json(await listUpcoming())
  }

  if (first === 'inscripcion' && second) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method === 'GET' && !action) {
      return res.status(200).json(publicEnrollment(await findEnrollment(second, String(req.query?.t || ''))))
    }
    if (req.method !== 'POST') return methodNotAllowed(res)
    const input = body(req)
    const { token } = tokenBody.parse(input)
    let e = await findEnrollment(second, token)

    if (action === 'pay') {
      if (e.status !== 'PENDIENTE_PAGO') throw new HttpError(409, 'Esta inscripción ya no está esperando pago')
      return res.status(200).json({ redirectUrl: await startPayment(e, req) })
    }
    if (action === 'confirm') {
      const paymentId = z.string().max(40).optional().parse(input.paymentId)
      if (paymentId && /^\d+$/.test(paymentId)) {
        const payment = await getPayment(paymentId)
        if (payment && String(payment.external_reference) === e.code) {
          await applyEnrollmentPayment(payment)
          e = await findEnrollment(second, token)
        }
      }
      return res.status(200).json(publicEnrollment(e))
    }
    if (action === 'mock-pay') {
      if (paymentMode() !== 'mock') throw new HttpError(404, 'No encontrado')
      const outcome = z.enum(['approved', 'rejected']).parse(input.outcome)
      await applyEnrollmentPayment({ id: `mock-${Date.now()}`, status: outcome, external_reference: e.code, transaction_amount: e.amount, currency_id: 'CLP' })
      return res.status(200).json(publicEnrollment(await findEnrollment(second, token)))
    }
    throw new HttpError(404, 'No encontrado')
  }

  if (second === 'enroll') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const e = await enroll(first, body(req))
    const redirectUrl = e.status === 'PENDIENTE_PAGO' ? await startPayment(e, req) : null
    return res.status(201).json({ code: e.code, token: e.accessToken, status: e.status, redirectUrl })
  }

  if (!second && req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60')
    return res.status(200).json(publicSeminar(await getSeminarBySlug(first)))
  }
  return methodNotAllowed(res)
})
