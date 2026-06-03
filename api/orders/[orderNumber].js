import { prisma } from '../config/prisma.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.query.orderNumber },
      select: {
        id: true, orderNumber: true, status: true, total: true, discount: true,
        customerName: true, shippingAddress: true, shippingCity: true, shippingRegion: true,
        createdAt: true, items: { select: { id: true, title: true, quantity: true, price: true } },
      },
    })
    if (!order) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
