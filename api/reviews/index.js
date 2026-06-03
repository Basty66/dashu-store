import { prisma } from '../../lib/config/prisma.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const reviews = await prisma.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(reviews)
    }
    if (req.method === 'POST') {
      const { customerName, customerEmail, rating, comment } = req.body
      if (!customerName || !rating || !comment) return res.status(400).json({ error: 'Faltan campos requeridos' })
      if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' })
      const review = await prisma.review.create({
        data: { customerName, customerEmail, rating: Number(rating), comment },
      })
      return res.status(201).json(review)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
