import { prisma } from '../../config/prisma.js'
import { requireAdmin } from '../../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(reviews)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
