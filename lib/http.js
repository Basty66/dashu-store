import { ZodError } from 'zod'
import { fieldErrors } from '../shared/checkoutSchema.js'

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

// Envuelve un handler de Vercel: errores esperados -> JSON claro, inesperados -> 500 sin filtrar detalles.
export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res)
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message, ...error.extra })
      }
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Revisa los datos ingresados', fields: fieldErrors(error) })
      }
      console.error('[api]', req.method, req.url, error)
      return res.status(500).json({ error: 'Error interno. Intenta nuevamente en unos minutos.' })
    }
  }
}

export function pathSegments(req, prefix) {
  const { pathname } = new URL(req.url, 'http://localhost')
  return pathname.replace(prefix, '').split('/').filter(Boolean).map(decodeURIComponent)
}

export function body(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'JSON inválido')
    }
  }
  return req.body
}

export function methodNotAllowed(res) {
  return res.status(405).json({ error: 'Método no permitido' })
}

export function parseId(value) {
  const id = Number.parseInt(value, 10)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido')
  return id
}

export function getCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function setCookie(res, name, value, { maxAge } = {}) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict']
  if (secure) parts.push('Secure')
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`)
  res.setHeader('Set-Cookie', parts.join('; '))
}

// URL pública del sitio, usada para las redirecciones y webhooks de Mercado Pago.
export function siteUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const proto = req.headers['x-forwarded-proto'] || 'http'
  return `${proto}://${req.headers.host || 'localhost:5173'}`
}
