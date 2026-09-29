import { handler, pathSegments, methodNotAllowed, body } from '../../lib/http.js'
import { applyPayment } from '../../lib/orders.js'
import { applyEnrollmentPayment } from '../../lib/seminars.js'
import { getPayment, verifyWebhookSignature } from '../../lib/mercadopago.js'

// POST /api/webhooks/mercadopago — notificaciones de pago de Mercado Pago.
// Nunca se confía en el cuerpo: el pago se vuelve a consultar en la API de MP.
export default handler(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const [provider] = pathSegments(req, /^\/api\/webhooks\/?/)
  if (provider !== 'mercadopago') return res.status(404).json({ error: 'No encontrado' })

  const payload = body(req)
  const query = req.query || {}
  const topic = query.type || query.topic || payload.type || payload.topic
  const dataId = query['data.id'] || payload.data?.id || (topic === 'payment' ? query.id : null)
  if (topic !== 'payment' || !dataId) return res.status(200).json({ ignored: true })

  if (!verifyWebhookSignature(req, dataId)) return res.status(401).json({ error: 'Firma inválida' })

  const payment = await getPayment(dataId)
  if (!payment) return res.status(200).json({ ignored: true })
  // DS-... = pedido de la tienda, SEM-... = inscripción a una capacitación
  const reference = String(payment.external_reference || '')
  const result = reference.startsWith('SEM-') ? await applyEnrollmentPayment(payment) : await applyPayment(payment)
  return res.status(200).json(result)
})
