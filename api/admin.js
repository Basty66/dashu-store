import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { handler, pathSegments, methodNotAllowed, body, parseId, siteUrl, HttpError } from '../lib/http.js'
import { checkPassword, startSession, endSession, readSession, requireAdmin, signState, verifyState } from '../lib/auth.js'
import { changeStatus, releaseExpiredOrders } from '../lib/orders.js'
import { listProducts, createProduct, updateProduct, deleteProduct, saveImage } from '../lib/catalog.js'
import { ORDER_STATUS, PAID_STATUSES } from '../shared/orderStatus.js'
import { LEAD_STATUS } from '../shared/seminars.js'
import { adminSeminarList, adminSeminar, saveSeminar, deleteSeminar, addManualEnrollment, setEnrollmentStatus, syncCalendar } from '../lib/seminars.js'
import { googleConfigured, googleStatus, authUrl, connectWithCode, disconnect } from '../lib/google.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- Sesión ----------
async function session(req, res) {
  if (req.method === 'GET') return res.status(200).json({ authenticated: Boolean(readSession(req)) })
  if (req.method === 'DELETE') {
    endSession(res)
    return res.status(200).json({ ok: true })
  }
  if (req.method === 'POST') {
    const { password } = body(req)
    if (!checkPassword(password)) {
      await sleep(700)
      throw new HttpError(401, 'Contraseña incorrecta')
    }
    startSession(res)
    return res.status(200).json({ authenticated: true })
  }
  return methodNotAllowed(res)
}

// ---------- Métricas ----------
async function stats(res) {
  await releaseExpiredOrders()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [paid, byStatus, lowStock, recent, recentItems] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: PAID_STATUSES } }, _sum: { total: true }, _count: true }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.product.findMany({ where: { isActive: true, stock: { lt: 40 } }, select: { id: true, title: true, stock: true } }),
    prisma.order.findMany({
      where: { status: { in: PAID_STATUSES }, paidAt: { gte: since } },
      select: { total: true, paidAt: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: PAID_STATUSES } } },
      select: { packUnits: true, quantity: true },
    }),
  ])

  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().slice(0, 10), total: 0, orders: 0 })
  }
  for (const order of recent) {
    const key = new Date(order.paidAt).toISOString().slice(0, 10)
    const day = days.find((d) => d.date === key)
    if (day) {
      day.total += order.total
      day.orders += 1
    }
  }

  const [upcoming, newLeads] = await Promise.all([
    prisma.seminar.findMany({
      where: { date: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }, isCancelled: false },
      orderBy: { date: 'asc' },
      take: 4,
      select: { id: true, title: true, city: true, date: true, capacity: true, seatsTaken: true, price: true, _count: { select: { enrollments: { where: { status: 'PREINSCRITO' } } } } },
    }),
    prisma.distributorLead.count({ where: { status: 'NUEVO' } }),
  ])
  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]))
  return res.status(200).json({
    revenue: paid._sum.total || 0,
    paidOrders: paid._count,
    revenue30d: recent.reduce((s, o) => s + o.total, 0),
    unitsSold: recentItems.reduce((s, i) => s + i.packUnits * i.quantity, 0),
    toShip: (counts.PAGADO || 0) + (counts.PREPARANDO || 0),
    awaitingPayment: counts.PENDIENTE_PAGO || 0,
    counts,
    lowStock,
    days,
    upcoming: upcoming.map(({ _count, ...s }) => ({ ...s, preRegistered: _count.enrollments })),
    newLeads,
  })
}

// ---------- Pedidos ----------
const statusSchema = z.object({
  status: z.enum(Object.keys(ORDER_STATUS)),
  courier: z.string().max(30).optional(),
  trackingNumber: z.string().max(60).optional(),
  trackingUrl: z.string().max(500).optional(),
  note: z.string().max(500).optional(),
  notify: z.boolean().optional(),
})

async function orders(req, res, id, action) {
  if (!id) {
    if (req.method !== 'GET') return methodNotAllowed(res)
    await releaseExpiredOrders()
    const { status, q } = req.query || {}
    const search = String(q || '').trim()
    const where = {
      ...(status && status !== 'all' ? { status: String(status) } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search.toUpperCase() } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
    const list = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { items: true },
    })
    return res.status(200).json(list)
  }

  const orderId = parseId(id)
  if (action === 'notes' && req.method === 'POST') {
    const { note } = z.object({ note: z.string().trim().min(1).max(500) }).parse(body(req))
    await prisma.orderEvent.create({ data: { orderId, status: 'NOTA_INTERNA', note } })
  } else if (req.method === 'PATCH') {
    const { status, ...options } = statusSchema.parse(body(req))
    await changeStatus(orderId, status, options, 'admin')
  } else if (req.method !== 'GET') {
    return methodNotAllowed(res)
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, events: { orderBy: { createdAt: 'asc' } } },
  })
  if (!order) throw new HttpError(404, 'Pedido no encontrado')
  return res.status(200).json(order)
}

// ---------- Productos ----------
async function products(req, res, id) {
  if (!id) {
    if (req.method === 'GET') return res.status(200).json(await listProducts({ includeInactive: true }))
    if (req.method === 'POST') return res.status(201).json(await createProduct(body(req)))
    return methodNotAllowed(res)
  }
  const productId = parseId(id)
  if (req.method === 'PATCH') return res.status(200).json(await updateProduct(productId, body(req)))
  if (req.method === 'DELETE') return res.status(200).json(await deleteProduct(productId))
  return methodNotAllowed(res)
}

// ---------- Cupones ----------
const couponSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/, 'Usa 3 a 30 letras, números o guiones'),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().int().min(1),
    minTotal: z.number().int().min(0).default(0),
    maxUses: z.number().int().min(1).nullable().default(null),
    expiresAt: z.string().nullable().default(null),
    isActive: z.boolean().default(true),
  })
  .refine((c) => c.type !== 'percentage' || c.value <= 90, { message: 'El porcentaje máximo es 90%', path: ['value'] })

function couponData(input) {
  const data = couponSchema.parse(input)
  return { ...data, expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59-04:00`) : null }
}

async function coupons(req, res, id) {
  if (!id) {
    if (req.method === 'GET') return res.status(200).json(await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }))
    if (req.method === 'POST') {
      const data = couponData(body(req))
      if (await prisma.coupon.findUnique({ where: { code: data.code } })) {
        throw new HttpError(400, 'Ese código ya existe', { fields: { code: 'Ya existe' } })
      }
      return res.status(201).json(await prisma.coupon.create({ data }))
    }
    return methodNotAllowed(res)
  }
  const couponId = parseId(id)
  if (req.method === 'PATCH') {
    const input = body(req)
    if (Object.keys(input).length === 1 && typeof input.isActive === 'boolean') {
      return res.status(200).json(await prisma.coupon.update({ where: { id: couponId }, data: { isActive: input.isActive } }))
    }
    const { code: _code, ...data } = couponData(input)
    return res.status(200).json(await prisma.coupon.update({ where: { id: couponId }, data }))
  }
  if (req.method === 'DELETE') {
    await prisma.coupon.delete({ where: { id: couponId } })
    return res.status(200).json({ ok: true })
  }
  return methodNotAllowed(res)
}

// ---------- Reseñas y mensajes ----------
async function reviews(req, res, id) {
  if (!id) {
    if (req.method !== 'GET') return methodNotAllowed(res)
    return res.status(200).json(await prisma.review.findMany({ orderBy: { createdAt: 'desc' } }))
  }
  const reviewId = parseId(id)
  if (req.method === 'PATCH') {
    const { isApproved } = z.object({ isApproved: z.boolean() }).parse(body(req))
    return res.status(200).json(await prisma.review.update({ where: { id: reviewId }, data: { isApproved } }))
  }
  if (req.method === 'DELETE') {
    await prisma.review.delete({ where: { id: reviewId } })
    return res.status(200).json({ ok: true })
  }
  return methodNotAllowed(res)
}

async function messages(req, res, id) {
  if (!id) {
    if (req.method !== 'GET') return methodNotAllowed(res)
    return res.status(200).json(await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }))
  }
  const messageId = parseId(id)
  if (req.method === 'PATCH') {
    const { read } = z.object({ read: z.boolean() }).parse(body(req))
    return res.status(200).json(await prisma.contactMessage.update({ where: { id: messageId }, data: { read } }))
  }
  if (req.method === 'DELETE') {
    await prisma.contactMessage.delete({ where: { id: messageId } })
    return res.status(200).json({ ok: true })
  }
  return methodNotAllowed(res)
}

// ---------- Capacitaciones ----------
async function seminars(req, res, id, action) {
  if (!id) {
    if (req.method === 'GET') return res.status(200).json(await adminSeminarList())
    if (req.method === 'POST') return res.status(201).json(await saveSeminar(null, body(req)))
    return methodNotAllowed(res)
  }
  const seminarId = parseId(id)
  if (action === 'sync' && req.method === 'POST') {
    await syncCalendar(seminarId)
    return res.status(200).json(await adminSeminar(seminarId))
  }
  if (action === 'enrollments' && req.method === 'POST') {
    await addManualEnrollment(seminarId, body(req))
    return res.status(201).json(await adminSeminar(seminarId))
  }
  if (req.method === 'GET') return res.status(200).json(await adminSeminar(seminarId))
  if (req.method === 'PATCH') {
    await saveSeminar(seminarId, body(req))
    return res.status(200).json(await adminSeminar(seminarId))
  }
  if (req.method === 'DELETE') {
    await deleteSeminar(seminarId)
    return res.status(200).json({ ok: true })
  }
  return methodNotAllowed(res)
}

async function enrollments(req, res, id) {
  if (req.method !== 'PATCH' || !id) return methodNotAllowed(res)
  const { status, force } = z.object({ status: z.enum(['PAGADO', 'CANCELADO']), force: z.boolean().default(false) }).parse(body(req))
  const updated = await setEnrollmentStatus(parseId(id), status, {
    force,
    extra: status === 'PAGADO' ? { paymentMethod: 'manual' } : {},
  })
  return res.status(200).json(await adminSeminar(updated.seminarId))
}

// ---------- Google Calendar ----------
async function google(req, res, id) {
  if (id === 'connect' && req.method === 'GET') {
    if (!googleConfigured()) throw new HttpError(400, 'Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno')
    return res.status(200).json({ url: authUrl(siteUrl(req), signState()) })
  }
  if (!id && req.method === 'GET') return res.status(200).json(await googleStatus())
  if (!id && req.method === 'DELETE') {
    await disconnect()
    return res.status(200).json(await googleStatus())
  }
  return methodNotAllowed(res)
}

// Google redirige aquí después de autorizar. Se valida con `state` firmado (no con la cookie).
async function googleCallback(req, res) {
  const { code, state, error } = req.query || {}
  let result = 'ok'
  if (error || !code || !verifyState(state)) {
    result = 'error'
  } else {
    try {
      await connectWithCode(String(code), siteUrl(req))
      const upcoming = await prisma.seminar.findMany({ where: { date: { gte: new Date() } }, select: { id: true } })
      for (const s of upcoming) await syncCalendar(s.id)
    } catch (e) {
      console.error('[google] callback', e.message)
      result = 'error'
    }
  }
  res.statusCode = 302
  res.setHeader('Location', `/admin/capacitaciones?google=${result}`)
  return res.end()
}

// ---------- Distribuidores ----------
async function distributors(req, res, id) {
  if (!id) {
    if (req.method !== 'GET') return methodNotAllowed(res)
    return res.status(200).json(await prisma.distributorLead.findMany({ orderBy: { createdAt: 'desc' } }))
  }
  const leadId = parseId(id)
  if (req.method === 'PATCH') {
    const data = z.object({ status: z.enum(Object.keys(LEAD_STATUS)).optional(), notes: z.string().max(1000).optional() }).parse(body(req))
    return res.status(200).json(await prisma.distributorLead.update({ where: { id: leadId }, data }))
  }
  if (req.method === 'DELETE') {
    await prisma.distributorLead.delete({ where: { id: leadId } })
    return res.status(200).json({ ok: true })
  }
  return methodNotAllowed(res)
}

export default handler(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  const [section, id, action] = pathSegments(req, /^\/api\/admin\/?/)
  if (section === 'session') return session(req, res)
  if (section === 'google' && id === 'callback') return googleCallback(req, res)

  requireAdmin(req)
  switch (section) {
    case 'seminars': return seminars(req, res, id, action)
    case 'enrollments': return enrollments(req, res, id)
    case 'google': return google(req, res, id)
    case 'distributors': return distributors(req, res, id)
    case 'stats': return stats(res)
    case 'orders': return orders(req, res, id, action)
    case 'products': return products(req, res, id)
    case 'images':
      if (req.method !== 'POST') return methodNotAllowed(res)
      return res.status(201).json(await saveImage(body(req).dataUrl))
    case 'coupons': return coupons(req, res, id)
    case 'reviews': return reviews(req, res, id)
    case 'messages': return messages(req, res, id)
    default: throw new HttpError(404, 'No encontrado')
  }
})
