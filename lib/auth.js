import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from './prisma.js'
import { HttpError, getCookie, setCookie } from './http.js'
import { hashPassword, verifyPassword, dummyVerify } from './password.js'

const COOKIE = 'dashu_admin'
const SESSION_SECONDS = 12 * 60 * 60
const MAX_FAILED = 5
const LOCK_MINUTES = 15

function secret() {
  const value = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD
  if (!value) throw new HttpError(500, 'Falta ADMIN_SECRET en las variables de entorno')
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

// Token firmado: base64url(JSON) + "." + HMAC. Lo usan la cookie de sesión y el `state` de Google.
function signToken(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function readToken(token) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

// ---------- Contraseñas ----------

export const passwordSchema = z
  .string()
  .min(10, 'Usa al menos 10 caracteres')
  .max(128, 'Máximo 128 caracteres')
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Combina letras y números')

export const emailSchema = z.string().trim().toLowerCase().email('Correo no válido').max(120)

export function publicAdmin(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, mustChangePassword: user.mustChangePassword }
}

// ---------- Sesión ----------

export function startSession(res, user) {
  setCookie(res, COOKIE, signToken({ sub: user.id, ver: user.sessionVersion, exp: Date.now() + SESSION_SECONDS * 1000 }), { maxAge: SESSION_SECONDS })
}

export function endSession(res) {
  setCookie(res, COOKIE, '', { maxAge: 0 })
}

// Persona con sesión válida: la firma debe calzar y la cuenta seguir activa con la misma versión
// de sesión (cambiar la clave o desactivar la cuenta cierra todas las sesiones abiertas).
export async function readSession(req) {
  const data = readToken(getCookie(req, COOKIE))
  if (!data?.sub) return null
  const user = await prisma.adminUser.findUnique({ where: { id: Number(data.sub) } })
  if (!user || !user.isActive || user.sessionVersion !== data.ver) return null
  return user
}

export async function requireAdmin(req) {
  const user = await readSession(req)
  if (!user) throw new HttpError(401, 'Sesión expirada. Vuelve a ingresar.')
  return user
}

export function requireOwner(user) {
  if (user.role !== 'owner') throw new HttpError(403, 'Solo el dueño de la tienda puede hacer esto')
}

// ---------- Ingreso ----------

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) })
const INVALID = 'Correo o contraseña incorrectos'

// Primera vez: si aún no hay cuentas, se entra con ADMIN_EMAIL + ADMIN_PASSWORD del entorno y se crea
// la cuenta de dueño (con la clave cifrada). Desde ahí esas variables ya no sirven para entrar.
async function bootstrapOwner(email, password) {
  if ((await prisma.adminUser.count()) > 0) return null
  const envEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const envPassword = process.env.ADMIN_PASSWORD
  if (!envEmail || !envPassword || email !== envEmail || !safeEqual(password, envPassword)) return null
  return prisma.adminUser.create({
    data: { email, name: 'Dueño', role: 'owner', passwordHash: await hashPassword(password), mustChangePassword: true },
  })
}

export async function login(input) {
  const { email, password } = loginSchema.parse(input)
  const boot = await bootstrapOwner(email, password)
  if (boot) return boot

  const user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    await dummyVerify(password)
    throw new HttpError(401, INVALID)
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60_000)
    throw new HttpError(429, `Demasiados intentos. Vuelve a intentar en ${minutes} min.`)
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1
    const locked = failed >= MAX_FAILED
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLogins: locked ? 0 : failed, lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    })
    if (locked) throw new HttpError(429, `Demasiados intentos. Vuelve a intentar en ${LOCK_MINUTES} min.`)
    throw new HttpError(401, INVALID)
  }
  return prisma.adminUser.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } })
}

// ---------- OAuth de Google (state) ----------

// Token firmado de corta duración para el parámetro `state` del OAuth de Google.
// (La cookie de sesión es SameSite=Strict y no viaja en la redirección desde google.com.)
export function signState() {
  return signToken({ purpose: 'google', exp: Date.now() + 10 * 60 * 1000 })
}

export function verifyState(state) {
  return readToken(state)?.purpose === 'google'
}

// ---------- Protección CSRF adicional ----------

// Además de SameSite=Strict: los cambios del admin solo se aceptan desde el mismo sitio.
export function requireSameOrigin(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return
  const origin = req.headers.origin
  if (!origin) return
  const host = req.headers['x-forwarded-host'] || req.headers.host
  let originHost = null
  try {
    originHost = new URL(origin).host
  } catch {
    // Origin malformado: se rechaza abajo.
  }
  if (originHost !== host) throw new HttpError(403, 'Origen no permitido')
}
