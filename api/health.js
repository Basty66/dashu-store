import { prisma } from './config/prisma.js'

export default async function handler(req, res) {
  const checks = { ok: true, db: false, timestamp: new Date().toISOString() }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = true
  } catch (e) {
    checks.ok = false
    checks.dbError = e.message
  }

  const code = checks.ok ? 200 : 503
  return res.status(code).json(checks)
}
