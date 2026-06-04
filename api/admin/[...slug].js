import { prisma } from '../../lib/config/prisma.js'
import { requireAdmin, generateToken } from '../../lib/config/auth.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { pathname } = new URL(req.url, 'http://localhost')
  const segments = pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean)

  if (segments[0] === 'debug') {
    return res.status(200).json({ url: req.url, pathname, segments, method: req.method, segments0: segments[0], segments1: segments[1] })
  }

  try {
    // POST /api/admin/auth
    if (segments[0] === 'auth' && req.method === 'POST') {
      const { password } = req.body
      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminPassword) return res.status(500).json({ error: 'ADMIN_PASSWORD no configurada' })
      if (password !== adminPassword) return res.status(401).json({ error: 'Contraseña incorrecta' })
      const token = generateToken()
      return res.status(200).json({ token, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
    }

    if (!requireAdmin(req, res)) return

    // /api/admin/coupons/:id
    if (segments[0] === 'coupons') {
      const id = segments[1] ? parseInt(segments[1]) : null
      if (id && !isNaN(id)) {
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
      }
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
    }

    // /api/admin/orders/:id
    if (segments[0] === 'orders') {
      const id = segments[1] ? parseInt(segments[1]) : null
      if (id && !isNaN(id) && req.method === 'PATCH') {
        const allowed = ['status']
        const data = {}
        for (const k of allowed) {
          if (req.body[k] !== undefined) data[k] = req.body[k]
        }
        const order = await prisma.order.update({ where: { id }, data })
        return res.status(200).json(order)
      }
      if (req.method === 'GET') {
        const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } })
        return res.status(200).json(orders)
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // /api/admin/reviews/:id
    if (segments[0] === 'reviews') {
      const id = segments[1] ? parseInt(segments[1]) : null
      if (id && !isNaN(id)) {
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
      }
      if (req.method === 'GET') {
        const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).json(reviews)
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // /api/admin/messages
    if (segments[0] === 'messages') {
      const id = segments[1] ? parseInt(segments[1]) : null
      if (id && !isNaN(id) && req.method === 'PATCH') {
        const msg = await prisma.contactMessage.update({ where: { id }, data: { read: true } })
        return res.status(200).json(msg)
      }
      if (req.method === 'GET') {
        const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).json(messages)
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
