import { z } from 'zod'
import { prisma } from '../prisma.js'
import { methodNotAllowed, body } from '../http.js'
import { notifyContactMessage } from '../email.js'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre').max(80),
  email: z.string().trim().email('Email no válido').max(120),
  phone: z.string().trim().max(20).optional().default(''),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10, 'Escribe un mensaje un poco más largo').max(3000),
})

// POST /api/contact — formulario de contacto (llega al buzón del admin y por email).
export default async function contact(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const data = contactSchema.parse(body(req))
  const message = await prisma.contactMessage.create({ data: { ...data, phone: data.phone || null } })
  await notifyContactMessage(message)
  return res.status(201).json({ ok: true })
}
