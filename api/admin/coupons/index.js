import { prisma } from '../../config/prisma.js'
import { requireAdmin } from '../../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  try {
    if (req.method === 'GET') {
      const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(coupons)
    }
    if (req.method === 'POST') {
      const { code, type, value, minTotal, maxUses, expiresAt } = req.body
      if (!code || !type || value === undefined) return res.status(400).json({ error: 'Faltan campos requeridos' })
      const exists = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
      if (exists) return res.status(400).json({ error: 'El código ya existe' })
      const coupon = await prisma.coupon.create({
        data: { code: code.toUpperCase(), type, value: Number(value), minTotal: Number(minTotal || 0), maxUses: maxUses ? Number(maxUses) : null, expiresAt: expiresAt ? new Date(expiresAt) : null },
      })
      return res.status(201).json(coupon)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
