import crypto from 'crypto'

const SECRET = () => process.env.ADMIN_PASSWORD || 'fallback-secret'
const TOKEN_DURATION = 24 * 60 * 60 * 1000

function toBase64(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function fromBase64(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

export function generateToken() {
  const payload = { role: 'admin', iat: Date.now() }
  const encoded = toBase64(JSON.stringify(payload))
  const sig = crypto.createHmac('sha256', SECRET()).update(encoded).digest('hex')
  return `${encoded}.${sig}`
}

export function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [encoded, sig] = parts
    const expected = crypto.createHmac('sha256', SECRET()).update(encoded).digest('hex')
    if (sig !== expected) return null
    const payload = JSON.parse(fromBase64(encoded))
    if (Date.now() - payload.iat > TOKEN_DURATION) return null
    return payload
  } catch {
    return null
  }
}

export function requireAdmin(req, res) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' })
    return false
  }
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'admin') {
    res.status(401).json({ error: 'Token inválido o expirado' })
    return false
  }
  return true
}
