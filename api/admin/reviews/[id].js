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
      const { isApproved } = req.body
      const review = await prisma.review.update({
        where: { id },
        data: { isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined },
      })
      return res.status(200).json(review)
    }
    if (req.method === 'DELETE') {
      await prisma.review.delete({ where: { id } })
      return res.status(200).json({ success: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
