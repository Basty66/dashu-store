// Integración con Google Calendar: cada capacitación es un evento privado en el calendario del dueño,
// con la lista de inscritos (nombre, teléfono, email) en la descripción, actualizada en cada inscripción.
import { HttpError } from './http.js'
import { getSetting, setSetting, deleteSettings } from './settings.js'
import { eventTimes, seminarTimeLabel, TIMEZONE, SEMINAR_KINDS } from '../shared/seminars.js'
import { formatCLP } from '../shared/pricing.js'

const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events']
const KEYS = { refreshToken: 'google_refresh_token', email: 'google_email', calendarId: 'google_calendar_id' }

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export const redirectUri = (baseUrl) => `${baseUrl}/api/admin/google/callback`

export function authUrl(baseUrl, state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(baseUrl),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

async function tokenRequest(params) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, ...params }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[google] token error', res.status, data.error)
    throw new HttpError(502, data.error === 'invalid_grant' ? 'La conexión con Google expiró. Vuelve a conectar Google Calendar.' : 'No pudimos conectar con Google.')
  }
  return data
}

export async function connectWithCode(code, baseUrl) {
  const tokens = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri(baseUrl) })
  if (!tokens.refresh_token) throw new HttpError(400, 'Google no entregó acceso permanente. Quita el acceso de la app en tu cuenta de Google e intenta de nuevo.')
  let email = ''
  try {
    email = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()).email || ''
  } catch { /* el email es solo informativo */ }
  await setSetting(KEYS.refreshToken, tokens.refresh_token)
  await setSetting(KEYS.email, email)
  cachedToken = null
  return { email }
}

export async function disconnect() {
  const refreshToken = await getSetting(KEYS.refreshToken)
  if (refreshToken) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, { method: 'POST' }).catch(() => null)
  }
  await deleteSettings([KEYS.refreshToken, KEYS.email])
  cachedToken = null
}

export async function googleStatus() {
  const [refreshToken, email, calendarId] = await Promise.all([getSetting(KEYS.refreshToken), getSetting(KEYS.email), getSetting(KEYS.calendarId)])
  return { configured: googleConfigured(), connected: Boolean(refreshToken), email, calendarId: calendarId || 'primary' }
}

let cachedToken = null

async function accessToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value
  const refreshToken = await getSetting(KEYS.refreshToken)
  if (!refreshToken) return null
  const data = await tokenRequest({ refresh_token: refreshToken, grant_type: 'refresh_token' })
  cachedToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 }
  return cachedToken.value
}

// Arma el evento del calendario (función pura, testeable).
export function buildCalendarEvent(seminar, enrollments, adminUrl) {
  const paid = enrollments.filter((e) => e.status === 'PAGADO')
  const pending = enrollments.filter((e) => e.status === 'PENDIENTE_PAGO')
  const pre = enrollments.filter((e) => e.status === 'PREINSCRITO')
  const times = eventTimes(seminar)
  const line = (e, i) => `${i + 1}. ${e.name} · ${e.phone} · ${e.email}${e.business ? ` · ${e.business}` : ''}`
  const description = [
    `${SEMINAR_KINDS[seminar.kind] || 'Capacitación'} · ${seminarTimeLabel(seminar)}`,
    seminar.host && `Con: ${seminar.host}`,
    seminar.price ? `Valor: ${formatCLP(seminar.price)}` : 'Valor por confirmar',
    '',
    `INSCRITOS PAGADOS (${paid.length}/${seminar.capacity})`,
    ...(paid.length ? paid.map(line) : ['Aún no hay inscritos pagados.']),
    pending.length ? `\nEsperando pago: ${pending.length}` : null,
    pre.length ? `\nPRE-INSCRITOS (${pre.length})\n${pre.map(line).join('\n')}` : null,
    '',
    `Gestionar en el panel: ${adminUrl}`,
  ].filter((v) => v !== null && v !== false).join('\n')

  return {
    summary: `${seminar.isCancelled ? '[CANCELADO] ' : ''}${seminar.title} · ${seminar.city}`,
    location: [seminar.venue, seminar.address, seminar.city].filter(Boolean).join(', '),
    description,
    start: times.allDay ? { date: times.start } : { dateTime: times.start, timeZone: TIMEZONE },
    end: times.allDay ? { date: times.end } : { dateTime: times.end, timeZone: TIMEZONE },
    // Sin invitados: la lista (con teléfonos) vive solo en el calendario del dueño y el evento es privado.
    // Cada inscrito agrega el evento a su propio calendario con el link de su confirmación.
    visibility: 'private',
    status: seminar.isCancelled ? 'cancelled' : 'confirmed',
    colorId: '6',
  }
}

async function calendarRequest(method, path, body) {
  const token = await accessToken()
  const calendarId = encodeURIComponent((await getSetting(KEYS.calendarId)) || 'primary')
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events${path}?sendUpdates=none`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, data }
}

// Crea o actualiza el evento. Devuelve el id del evento o lanza error.
export async function upsertCalendarEvent(seminar, enrollments, adminUrl) {
  if (!googleConfigured() || !(await getSetting(KEYS.refreshToken))) return null
  const event = buildCalendarEvent(seminar, enrollments, adminUrl)
  if (seminar.calendarEventId) {
    const res = await calendarRequest('PUT', `/${encodeURIComponent(seminar.calendarEventId)}`, event)
    if (res.ok) return res.data.id
    if (res.status !== 404 && res.status !== 410) throw new Error(res.data?.error?.message || `Google respondió ${res.status}`)
  }
  if (seminar.isCancelled) return seminar.calendarEventId
  const created = await calendarRequest('POST', '', event)
  if (!created.ok) throw new Error(created.data?.error?.message || `Google respondió ${created.status}`)
  return created.data.id
}
