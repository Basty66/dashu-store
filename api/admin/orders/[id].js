import { prisma } from '../../config/prisma.js'
import { requireAdmin } from '../../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  const id = parseInt(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    if (req.method === 'PATCH') {
      const allowed = ['status']
      const data = {}
      for (const k of allowed) {
        if (req.body[k] !== undefined) data[k] = req.body[k]
      }
      const order = await prisma.order.update({
        where: { id },
        data,
      })
      return res.status(200).json(order)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
