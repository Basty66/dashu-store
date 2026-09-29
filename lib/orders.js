import crypto from 'node:crypto'
import { prisma } from './prisma.js'
import { HttpError } from './http.js'
import { checkoutSchema } from '../shared/checkoutSchema.js'
import { shippingCostFor, resolveTrackingUrl, courierName, COURIERS } from '../shared/shipping.js'
import { couponDiscount, formatCLP } from '../shared/pricing.js'
import { ADMIN_TRANSITIONS, ORDER_STATUS, PAID_STATUSES } from '../shared/orderStatus.js'
import { PAYMENT_WINDOW_MINUTES } from '../shared/store.js'
import { formatRut } from '../shared/rut.js'
import { notifyOrderPaid, notifyOrderShipped, notifyOrderDelivered } from './email.js'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 32 símbolos, sin 0/O ni 1/I

function randomCode(length) {
  return Array.from(crypto.randomBytes(length), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

const ORDER_INCLUDE = {
  items: true,
  events: { orderBy: { createdAt: 'asc' } },
}

// ---------- Cupones ----------

export async function validateCoupon(code, subtotal) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  if (!coupon || !coupon.isActive) throw new HttpError(400, 'Cupón no válido')
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new HttpError(400, 'Este cupón expiró')
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new HttpError(400, 'Este cupón ya alcanzó su límite de usos')
  }
  if (subtotal < coupon.minTotal) throw new HttpError(400, `Este cupón aplica en compras desde ${formatCLP(coupon.minTotal)}`)
  return { coupon, discount: couponDiscount(coupon, subtotal) }
}

// ---------- Cotización (precios siempre desde la base de datos) ----------

function mergeLines(items) {
  const merged = new Map()
  for (const item of items) {
    const key = `${item.productId}:${item.packUnits}`
    const prev = merged.get(key)
    merged.set(key, { ...item, quantity: (prev?.quantity || 0) + item.quantity })
  }
  return [...merged.values()]
}

export async function quote({ items, region, couponCode }) {
  const requested = mergeLines(items)
  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(requested.map((i) => i.productId))] } },
    include: { packs: true },
  })

  const lines = []
  const problems = []
  for (const item of requested) {
    const product = products.find((p) => p.id === item.productId)
    const pack = product?.packs.find((p) => p.units === item.packUnits && p.isActive)
    if (!product || !product.isActive || !pack) {
      problems.push({ productId: item.productId, packUnits: item.packUnits, error: 'Este formato ya no está disponible' })
      continue
    }
    lines.push({
      productId: product.id,
      packUnits: pack.units,
      quantity: item.quantity,
      title: product.title,
      image: product.images[0] || null,
      unitPrice: pack.price,
      lineTotal: pack.price * item.quantity,
      units: pack.units * item.quantity,
    })
  }

  const unitsByProduct = new Map()
  for (const line of lines) unitsByProduct.set(line.productId, (unitsByProduct.get(line.productId) || 0) + line.units)
  for (const [productId, units] of unitsByProduct) {
    const product = products.find((p) => p.id === productId)
    if (units > product.stock) {
      problems.push({
        productId,
        available: product.stock,
        error: product.stock > 0
          ? `Solo quedan ${product.stock} unidades de ${product.title} (pediste ${units})`
          : `${product.title} está agotado`,
      })
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  let discount = 0
  let coupon = null
  let couponError = null
  if (couponCode) {
    try {
      const result = await validateCoupon(couponCode, subtotal)
      coupon = { code: result.coupon.code, type: result.coupon.type, value: result.coupon.value }
      discount = result.discount
    } catch (error) {
      if (!(error instanceof HttpError)) throw error
      couponError = error.message
    }
  }
  const shipping = shippingCostFor(region, subtotal - discount)
  return {
    lines,
    problems,
    unitsByProduct,
    subtotal,
    discount,
    coupon,
    couponError,
    shipping,
    total: subtotal - discount + (shipping ?? 0),
    totalUnits: lines.reduce((sum, l) => sum + l.units, 0),
  }
}

export function publicQuote(q) {
  const { unitsByProduct: _omit, ...rest } = q
  return rest
}

// ---------- Crear pedido (reserva stock de forma atómica) ----------

export async function createOrder(input) {
  const data = checkoutSchema.parse(input)
  await releaseExpiredOrders()

  const q = await quote({ items: data.items, region: data.customer.region, couponCode: data.couponCode })
  if (q.problems.length) throw new HttpError(409, 'Algunos productos de tu carrito cambiaron', { problems: q.problems })
  if (data.couponCode && q.couponError) {
    throw new HttpError(400, q.couponError, { fields: { couponCode: q.couponError } })
  }
  if (q.shipping === null) throw new HttpError(400, 'Selecciona una región de despacho válida')

  const c = data.customer
  return prisma.$transaction(async (tx) => {
    for (const [productId, units] of q.unitsByProduct) {
      const reserved = await tx.product.updateMany({
        where: { id: productId, isActive: true, stock: { gte: units } },
        data: { stock: { decrement: units } },
      })
      if (reserved.count !== 1) {
        throw new HttpError(409, 'Otro cliente acaba de comprar parte del stock. Revisa tu carrito.')
      }
    }

    return tx.order.create({
      data: {
        orderNumber: `DS-${randomCode(6)}`,
        accessToken: crypto.randomBytes(24).toString('base64url'),
        status: 'PENDIENTE_PAGO',
        subtotal: q.subtotal,
        shippingCost: q.shipping,
        discount: q.discount,
        total: q.total,
        couponCode: q.coupon?.code || null,
        expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000),
        customerName: c.name,
        customerEmail: c.email,
        customerPhone: c.phone,
        customerRut: c.rut ? formatRut(c.rut) : null,
        documentType: c.documentType,
        businessName: c.documentType === 'factura' ? c.businessName : null,
        businessActivity: c.documentType === 'factura' ? c.businessActivity : null,
        shippingRegion: c.region,
        shippingCommune: c.commune,
        shippingAddress: c.address,
        notes: c.notes || null,
        items: {
          create: q.lines.map((l) => ({
            productId: l.productId,
            title: l.title,
            packUnits: l.packUnits,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          })),
        },
        events: {
          create: { status: 'PENDIENTE_PAGO', note: 'Recibimos tu pedido y reservamos el stock.' },
        },
      },
      include: ORDER_INCLUDE,
    })
  })
}

// ---------- Stock ----------

async function releaseStock(tx, orderId) {
  const flagged = await tx.order.updateMany({ where: { id: orderId, stockReleased: false }, data: { stockReleased: true } })
  if (flagged.count !== 1) return
  const items = await tx.orderItem.findMany({ where: { orderId } })
  for (const item of items) {
    if (!item.productId) continue
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.packUnits * item.quantity } },
    })
  }
}

// Si un pedido vencido se paga igual, se vuelve a descontar el stock (puede quedar negativo = sobreventa).
async function reserveStockAgain(tx, orderId) {
  const flagged = await tx.order.updateMany({ where: { id: orderId, stockReleased: true }, data: { stockReleased: false } })
  if (flagged.count !== 1) return false
  const items = await tx.orderItem.findMany({ where: { orderId } })
  let oversold = false
  for (const item of items) {
    if (!item.productId) continue
    const product = await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.packUnits * item.quantity } },
    })
    if (product.stock < 0) oversold = true
  }
  return oversold
}

export async function releaseExpiredOrders() {
  const expired = await prisma.order.findMany({
    where: { status: 'PENDIENTE_PAGO', expiresAt: { lt: new Date() } },
    select: { id: true },
    take: 25,
  })
  for (const { id } of expired) {
    await prisma.$transaction(async (tx) => {
      const moved = await tx.order.updateMany({ where: { id, status: 'PENDIENTE_PAGO' }, data: { status: 'EXPIRADO' } })
      if (moved.count !== 1) return
      await releaseStock(tx, id)
      await tx.orderEvent.create({
        data: { orderId: id, status: 'EXPIRADO', note: 'No recibimos el pago a tiempo y liberamos el stock reservado.' },
      })
    })
  }
}

// ---------- Cambios de estado ----------

function defaultNote(status, order) {
  switch (status) {
    case 'PAGADO': return 'Pago confirmado. Ya estamos preparando todo.'
    case 'PREPARANDO': return 'Estamos preparando y embalando tu pedido.'
    case 'ENVIADO': {
      const courier = courierName(order.courier)
      return order.trackingNumber
        ? `Tu pedido va en camino con ${courier}. N° de seguimiento: ${order.trackingNumber}.`
        : `Tu pedido va en camino con ${courier}.`
    }
    case 'ENTREGADO': return '¡Pedido entregado! Gracias por comprar en DASHU STORE.'
    case 'CANCELADO': return 'Pedido cancelado.'
    default: return null
  }
}

/**
 * Cambia el estado de un pedido de forma segura (control de concurrencia + historial + emails).
 * actor 'admin' respeta ADMIN_TRANSITIONS; 'system' se usa para pagos confirmados por Mercado Pago.
 */
export async function changeStatus(orderId, next, options = {}, actor = 'admin') {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new HttpError(404, 'Pedido no encontrado')
  if (!ORDER_STATUS[next]) throw new HttpError(400, 'Estado no válido')

  const updatingShipment = next === 'ENVIADO' && order.status === 'ENVIADO'
  if (!updatingShipment) {
    if (order.status === next) throw new HttpError(400, 'El pedido ya está en ese estado')
    if (actor === 'admin' && !ADMIN_TRANSITIONS[order.status]?.includes(next)) {
      throw new HttpError(400, `No se puede pasar de "${ORDER_STATUS[order.status].label}" a "${ORDER_STATUS[next].label}"`)
    }
  }

  const data = { status: next, ...(options.extra || {}) }
  if (next === 'PAGADO') data.paidAt = new Date()
  if (next === 'ENTREGADO') data.deliveredAt = new Date()
  if (next === 'ENVIADO') {
    const courier = options.courier
    if (!courier || !COURIERS[courier]) throw new HttpError(400, 'Selecciona el courier del envío')
    const trackingNumber = options.trackingNumber?.trim() || null
    const manualUrl = options.trackingUrl?.trim() || null
    if (manualUrl && !/^https:\/\//.test(manualUrl)) throw new HttpError(400, 'El link de seguimiento debe empezar con https://')
    Object.assign(data, {
      courier,
      trackingNumber,
      trackingUrl: resolveTrackingUrl(courier, trackingNumber, manualUrl),
      shippedAt: order.shippedAt || new Date(),
    })
  }

  let oversold = false
  const updated = await prisma.$transaction(async (tx) => {
    const guard = await tx.order.updateMany({ where: { id: orderId, status: order.status }, data })
    if (guard.count !== 1) throw new HttpError(409, 'El pedido cambió mientras lo editabas. Recarga e intenta de nuevo.')

    if (next === 'CANCELADO' || next === 'EXPIRADO') await releaseStock(tx, orderId)
    if (next === 'PAGADO' && order.status === 'EXPIRADO') oversold = await reserveStockAgain(tx, orderId)
    if (next === 'PAGADO' && order.couponCode) {
      await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } })
    }

    const note = options.note?.trim() || defaultNote(next, { ...order, ...data })
    await tx.orderEvent.create({ data: { orderId, status: next, note } })
    if (oversold) {
      await tx.orderEvent.create({
        data: { orderId, status: 'NOTA_INTERNA', note: 'Pago recibido después de vencer la reserva: revisar stock (quedó negativo).' },
      })
    }
    return tx.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE })
  })

  if (!updatingShipment || options.notify) {
    if (next === 'PAGADO') await notifyOrderPaid(updated)
    if (next === 'ENVIADO') await notifyOrderShipped(updated)
    if (next === 'ENTREGADO') await notifyOrderDelivered(updated)
  }
  return updated
}

// ---------- Pagos de Mercado Pago ----------

export async function applyPayment(payment) {
  const order = await prisma.order.findUnique({ where: { orderNumber: String(payment.external_reference || '') } })
  if (!order) return { ok: false, reason: 'order_not_found' }

  if (payment.status === 'approved') {
    if (Number(payment.transaction_amount) !== order.total || payment.currency_id !== 'CLP') {
      console.error('[mp] Monto no coincide', order.orderNumber, payment.transaction_amount, order.total)
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'monto_no_coincide' } })
      await prisma.orderEvent.create({
        data: { orderId: order.id, status: 'NOTA_INTERNA', note: `Pago ${payment.id} por ${payment.transaction_amount} no coincide con el total. Revisar en Mercado Pago.` },
      })
      return { ok: false, reason: 'amount_mismatch' }
    }
    if (order.status === 'PENDIENTE_PAGO' || order.status === 'EXPIRADO' || order.status === 'CANCELADO') {
      if (order.status === 'CANCELADO') {
        await prisma.orderEvent.create({
          data: { orderId: order.id, status: 'NOTA_INTERNA', note: `Llegó el pago ${payment.id} de un pedido cancelado. Revisar y reembolsar si corresponde.` },
        })
        return { ok: true, status: order.status }
      }
      try {
        const updated = await changeStatus(order.id, 'PAGADO', {
          note: 'Pago aprobado en Mercado Pago.',
          extra: { paymentStatus: 'approved', mpPaymentId: String(payment.id) },
        }, 'system')
        return { ok: true, status: updated.status }
      } catch (error) {
        if (error instanceof HttpError && (error.status === 409 || error.status === 400)) return { ok: true, status: 'PAGADO' }
        throw error
      }
    }
    return { ok: true, status: order.status }
  }

  if (PAID_STATUSES.includes(order.status)) {
    if (['refunded', 'charged_back', 'cancelled'].includes(payment.status) && String(payment.id) === order.mpPaymentId) {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: payment.status } })
      await prisma.orderEvent.create({
        data: { orderId: order.id, status: 'NOTA_INTERNA', note: `Mercado Pago informa estado "${payment.status}" para el pago ${payment.id}.` },
      })
    }
    return { ok: true, status: order.status }
  }

  // rechazado / en proceso: el cliente puede reintentar mientras la reserva siga vigente.
  await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: payment.status } })
  return { ok: true, status: order.status, paymentStatus: payment.status }
}

// ---------- Vistas ----------

export async function findOrderForCustomer(orderNumber, { token, email }) {
  const number = String(orderNumber || '').trim().toUpperCase()
  const existing = await prisma.order.findUnique({ where: { orderNumber: number }, select: { status: true, expiresAt: true } })
  if (existing?.status === 'PENDIENTE_PAGO' && existing.expiresAt < new Date()) await releaseExpiredOrders()

  const order = await prisma.order.findUnique({ where: { orderNumber: number }, include: ORDER_INCLUDE })
  const tokenOk = token && order && token.length === order.accessToken.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.accessToken))
  const emailOk = email && order && email.trim().toLowerCase() === order.customerEmail.toLowerCase()
  if (!order || (!tokenOk && !emailOk)) {
    throw new HttpError(404, 'No encontramos un pedido con esos datos. Revisa el número y el email.')
  }
  return order
}

export function publicOrder(order) {
  return {
    orderNumber: order.orderNumber,
    accessToken: order.accessToken,
    status: order.status,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    expiresAt: order.expiresAt,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    couponCode: order.couponCode,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    documentType: order.documentType,
    shippingRegion: order.shippingRegion,
    shippingCommune: order.shippingCommune,
    shippingAddress: order.shippingAddress,
    courier: order.courier,
    courierName: order.courier ? courierName(order.courier) : null,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      title: i.title,
      packUnits: i.packUnits,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    events: order.events
      .filter((e) => e.status !== 'NOTA_INTERNA')
      .map((e) => ({ status: e.status, note: e.note, createdAt: e.createdAt })),
  }
}
