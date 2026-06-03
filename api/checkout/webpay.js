import { prisma } from '../config/prisma.js'
import { notifyNewOrder } from '../notifications/new-order.js'
import { validateStock } from '../utils/stock.js'
import { validateCoupon } from '../utils/coupon.js'

const WEBPAY_URL = process.env.WEBPAY_ENVIRONMENT === 'production'
  ? 'https://webpay3g.transbank.cl'
  : 'https://webpay3gint.transbank.cl'

function getBaseUrl(req) {
  return `${process.env.VERCEL_PROTOCOL || 'https'}://${process.env.VERCEL_URL || req.headers.host || 'localhost:5173'}`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { items, customer, couponCode } = req.body

    if (!items?.length || !customer?.name || !customer?.email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const stockErrors = await validateStock(items)
    if (stockErrors.length > 0) {
      return res.status(409).json({ error: 'Stock insuficiente', details: stockErrors })
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

    let discount = 0
    if (couponCode) {
      const validated = await validateCoupon(couponCode, subtotal + 4)
      if (!validated.valid) {
        return res.status(400).json({ error: validated.error })
      }
      discount = validated.discount
    }

    const total = Math.max(subtotal + 4 - discount, 0)
    const orderNumber = `DASHU-${Date.now().toString(36).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        total,
        discount,
        couponCode: couponCode || null,
        paymentMethod: 'webpay',
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        shippingRegion: customer.region || '',
        shippingCity: customer.city || '',
        shippingAddress: customer.address || '',
        notes: customer.notes || '',
        items: {
          create: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
            title: i.title,
          })),
        },
      },
    })

    notifyNewOrder(order)

    const baseUrl = getBaseUrl(req)

    const transbankBody = {
      buy_order: orderNumber,
      session_id: String(order.id),
      amount: total * 1000,
      return_url: `${baseUrl}/api/webhooks/webpay/return`,
    }

    const token = Buffer.from(
      `${process.env.WEBPAY_COMMERCE_CODE}:${process.env.WEBPAY_API_KEY}`
    ).toString('base64')

    const tbRes = await fetch(`${WEBPAY_URL}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`,
      },
      body: JSON.stringify(transbankBody),
    })

    const tbData = await tbRes.json()

    if (!tbData.url || !tbData.token) {
      throw new Error('Error al crear transacción Webpay')
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: tbData.token },
    })

    return res.status(200).json({ url: tbData.url, token: tbData.token, orderNumber })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
