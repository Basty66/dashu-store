import { prisma } from '../../lib/config/prisma.js'
import { requireAdmin } from '../../lib/config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { pathname } = new URL(req.url, 'http://localhost')
  const segments = pathname.replace(/^\/api\/products\/?/, '').split('/').filter(Boolean)
  const id = segments[0] ? parseInt(segments[0]) : null

  try {
    // Individual product: /api/products/:id
    if (id && !isNaN(id)) {
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
    }

    // List/Create: /api/products
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
