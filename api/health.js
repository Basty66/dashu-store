import { prisma } from '../lib/prisma.js'
import { paymentMode } from '../lib/mercadopago.js'

export default async function health(req, res) {
  const checks = { ok: true, db: false, payments: paymentMode() || 'off', timestamp: new Date().toISOString() }
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = true
  } catch {
    checks.ok = false
  }
  return res.status(checks.ok ? 200 : 503).json(checks)
}
