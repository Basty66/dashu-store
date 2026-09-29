import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { handler, pathSegments, methodNotAllowed, body, siteUrl, HttpError } from '../../lib/http.js'
import { quote, publicQuote, createOrder, applyPayment, findOrderForCustomer, publicOrder } from '../../lib/orders.js'
import { createPreference, getPayment, paymentMode } from '../../lib/mercadopago.js'
import { quoteSchema } from '../../shared/checkoutSchema.js'

const orderRef = z.object({ orderNumber: z.string().min(3).max(20), token: z.string().min(10).max(80) })

async function startPayment(order, req) {
  const preference = await createPreference(order, siteUrl(req))
  await prisma.order.update({ where: { id: order.id }, data: { mpPreferenceId: preference.id } })
  return preference.url
}

export default handler(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const [action] = pathSegments(req, /^\/api\/checkout\/?/)
  const input = body(req)

  // Totales calculados en el servidor para el resumen del carrito/checkout.
  if (action === 'quote') {
    const q = await quote(quoteSchema.parse(input))
    return res.status(200).json({ ...publicQuote(q), paymentsEnabled: paymentMode() !== null })
  }

  // Crea el pedido, reserva stock y devuelve el link de pago de Mercado Pago.
  if (action === 'create') {
    const order = await createOrder(input)
    try {
      const redirectUrl = await startPayment(order, req)
      return res.status(201).json({ orderNumber: order.orderNumber, token: order.accessToken, redirectUrl })
    } catch (error) {
      // Si no se pudo iniciar el pago, se deshace el pedido y se libera el stock.
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.packUnits * item.quantity } } })
          }
        }
        await tx.order.delete({ where: { id: order.id } })
      })
      throw error
    }
  }

  // Reintentar el pago de un pedido que sigue reservado.
  if (action === 'pay') {
    const { orderNumber, token } = orderRef.parse(input)
    const order = await findOrderForCustomer(orderNumber, { token })
    if (order.status !== 'PENDIENTE_PAGO') throw new HttpError(409, 'Este pedido ya no está esperando pago')
    return res.status(200).json({ redirectUrl: await startPayment(order, req) })
  }

  // Al volver de Mercado Pago: confirma el pago directo con la API (no depende del webhook).
  if (action === 'confirm') {
    const { orderNumber, token, paymentId } = orderRef.extend({ paymentId: z.string().max(40).optional() }).parse(input)
    let order = await findOrderForCustomer(orderNumber, { token })
    if (paymentId && /^\d+$/.test(paymentId)) {
      const payment = await getPayment(paymentId)
      if (payment && String(payment.external_reference) === order.orderNumber) {
        await applyPayment(payment)
        order = await findOrderForCustomer(orderNumber, { token })
      }
    }
    return res.status(200).json(publicOrder(order))
  }

  // Solo desarrollo local (PAYMENTS_MOCK=1): simula la respuesta de Mercado Pago.
  if (action === 'mock-pay') {
    if (paymentMode() !== 'mock') throw new HttpError(404, 'No encontrado')
    const { orderNumber, token, outcome } = orderRef.extend({ outcome: z.enum(['approved', 'rejected']) }).parse(input)
    const order = await findOrderForCustomer(orderNumber, { token })
    await applyPayment({
      id: `mock-${Date.now()}`,
      status: outcome,
      external_reference: order.orderNumber,
      transaction_amount: order.total,
      currency_id: 'CLP',
    })
    return res.status(200).json(publicOrder(await findOrderForCustomer(orderNumber, { token })))
  }

  throw new HttpError(404, 'No encontrado')
})
