import { prisma } from '../../config/prisma.js'
import { requireAdmin } from '../../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  const id = parseInt(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    if (req.method === 'PATCH') {
      const allowed = ['value', 'minTotal', 'maxUses', 'expiresAt', 'isActive', 'type']
      const data = {}
      for (const k of allowed) {
        if (req.body[k] !== undefined) {
          if (k === 'expiresAt') data[k] = req.body[k] ? new Date(req.body[k]) : null
          else if (k === 'isActive') data[k] = Boolean(req.body[k])
          else if (k === 'type') data[k] = req.body[k]
          else data[k] = Number(req.body[k])
        }
      }
      const coupon = await prisma.coupon.update({ where: { id }, data })
      return res.status(200).json(coupon)
    }
    if (req.method === 'DELETE') {
      await prisma.coupon.delete({ where: { id } })
      return res.status(200).json({ success: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
