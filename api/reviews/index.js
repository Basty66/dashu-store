import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { handler, methodNotAllowed, body } from '../../lib/http.js'

const reviewSchema = z.object({
  customerName: z.string().trim().min(2, 'Ingresa tu nombre').max(60),
  customerEmail: z.string().trim().email('Email no válido').max(120).optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, 'Cuéntanos un poco más (mín. 10 caracteres)').max(800),
})

export default handler(async (req, res) => {
  if (req.method === 'GET') {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, customerName: true, rating: true, comment: true, createdAt: true },
    })
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(reviews)
  }
  if (req.method === 'POST') {
    const data = reviewSchema.parse(body(req))
    await prisma.review.create({ data: { ...data, customerEmail: data.customerEmail || null } })
    return res.status(201).json({ ok: true })
  }
  return methodNotAllowed(res)
})
