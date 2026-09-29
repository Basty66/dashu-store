import crypto from 'node:crypto'
import { HttpError, getCookie, setCookie } from './http.js'

const COOKIE = 'dashu_admin'
const SESSION_SECONDS = 12 * 60 * 60

function secret() {
  const value = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD
  if (!value) throw new HttpError(500, 'ADMIN_PASSWORD no está configurada')
  return value
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new HttpError(500, 'ADMIN_PASSWORD no está configurada')
  return typeof password === 'string' && safeEqual(password, expected)
}

export function startSession(res) {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url')
  setCookie(res, COOKIE, `${payload}.${sign(payload)}`, { maxAge: SESSION_SECONDS })
}

export function endSession(res) {
  setCookie(res, COOKIE, '', { maxAge: 0 })
}

export function readSession(req) {
  const token = getCookie(req, COOKIE)
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.role === 'admin' && data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

// Token firmado de corta duración para el parámetro `state` del OAuth de Google.
// (La cookie de sesión es SameSite=Strict y no viaja en la redirección desde google.com.)
export function signState() {
  const payload = Buffer.from(JSON.stringify({ purpose: 'google', exp: Date.now() + 10 * 60 * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyState(state) {
  const [payload, signature] = String(state || '').split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.purpose === 'google' && data.exp > Date.now()
  } catch {
    return false
  }
}

export function requireAdmin(req) {
  if (!readSession(req)) throw new HttpError(401, 'Sesión expirada. Vuelve a ingresar.')
}
