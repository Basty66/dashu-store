import { prisma } from '../prisma.js'
import { methodNotAllowed, body } from '../http.js'
import { notifyDistributorLead } from '../email.js'
import { distributorLeadSchema } from '../../shared/seminars.js'
import { formatRut } from '../../shared/rut.js'

// POST /api/distributors — postulación al programa de distribuidores (con respuesta automática por email).
export default async function distributors(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)
  const data = distributorLeadSchema.parse(body(req))
  const lead = await prisma.distributorLead.create({
    data: { ...data, rut: data.rut ? formatRut(data.rut) : null, message: data.message || null },
  })
  await notifyDistributorLead(lead)
  return res.status(201).json({ ok: true, id: lead.id })
}
