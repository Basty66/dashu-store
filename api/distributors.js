import { prisma } from '../lib/prisma.js'
import { handler, methodNotAllowed, body } from '../lib/http.js'
import { notifyDistributorLead } from '../lib/email.js'
import { distributorLeadSchema } from '../shared/seminars.js'
import { formatRut } from '../shared/rut.js'

// POST /api/distributors — postulación al programa de distribuidores (con respuesta automática por email).
export default handler(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const data = distributorLeadSchema.parse(body(req))
  const lead = await prisma.distributorLead.create({
    data: { ...data, rut: data.rut ? formatRut(data.rut) : null, message: data.message || null },
  })
  await notifyDistributorLead(lead)
  return res.status(201).json({ ok: true, id: lead.id })
})
