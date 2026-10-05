import { prisma } from '../prisma.js'
import { paymentMode } from '../mercadopago.js'

// GET /api/health — chequeo para monitoreo: base de datos y modo de pagos.
export default async function health(req, res) {
  const checks = { ok: true, db: false, payments: paymentMode() || 'off', timestamp: new Date().toISOString() }
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = true
  } catch {
    checks.ok = false
  }
  res.setHeader('Cache-Control', 'no-store')
  return res.status(checks.ok ? 200 : 503).json(checks)
}
