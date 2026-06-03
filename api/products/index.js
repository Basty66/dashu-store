import { prisma } from '../config/prisma.js'
import { requireAdmin } from '../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(products)
    }
    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return
      const { title, description, price, offerPrice, stock, images } = req.body
      if (!title || !description || !price) return res.status(400).json({ error: 'Faltan campos requeridos' })
      const product = await prisma.product.create({
        data: { title, description, price: Number(price), offerPrice: offerPrice ? Number(offerPrice) : null, stock: Number(stock || 0), images: images || [] }
      })
      return res.status(201).json(product)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
