import { prisma } from '../config/prisma.js'
import { requireAdmin } from '../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const id = parseInt(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(product)
    }
    if (req.method === 'PATCH') {
      if (!requireAdmin(req, res)) return
      const allowed = ['title', 'description', 'price', 'offerPrice', 'stock', 'images']
      const data = {}
      for (const k of allowed) {
        if (req.body[k] !== undefined) data[k] = k === 'price' || k === 'offerPrice' || k === 'stock' ? Number(req.body[k]) : req.body[k]
      }
      const product = await prisma.product.update({ where: { id }, data })
      return res.status(200).json(product)
    }
    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return
      await prisma.product.delete({ where: { id } })
      return res.status(200).json({ success: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
