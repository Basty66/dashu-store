// Capacitaciones: tipos, estados, fechas en hora de Chile y validación de formularios.
import { z } from 'zod'
import { isValidRut } from './rut.js'
import { REGION_NAMES } from './chile.js'

export const TIMEZONE = 'America/Santiago'

export const SEMINAR_KINDS = {
  seminario: 'Seminario',
  curso: 'Curso práctico',
  clase: 'Clase práctica',
  evento: 'Evento',
}

export const ENROLLMENT_STATUS = {
  PREINSCRITO: { label: 'Pre-inscrito', tone: 'info' },
  PENDIENTE_PAGO: { label: 'Esperando pago', tone: 'warning' },
  PAGADO: { label: 'Inscrito', tone: 'success' },
  CANCELADO: { label: 'Cancelado', tone: 'danger' },
  EXPIRADO: { label: 'Pago no completado', tone: 'neutral' },
}

// Estados que ocupan cupo o cuentan como inscripción activa.
export const ACTIVE_ENROLLMENT = ['PREINSCRITO', 'PENDIENTE_PAGO', 'PAGADO']

export const LEAD_STATUS = {
  NUEVO: { label: 'Nuevo', tone: 'gold' },
  CONTACTADO: { label: 'Contactado', tone: 'info' },
  APROBADO: { label: 'Aprobado', tone: 'success' },
  DESCARTADO: { label: 'Descartado', tone: 'neutral' },
}

// "2026-10-18" -> fecha guardada a mediodía de Chile (evita saltos por zona horaria).
export function dateFromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 15, 0, 0))
}

// Fecha -> "2026-10-18" según el calendario de Chile.
export function dateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date))
  const get = (t) => parts.find((p) => p.type === t).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function formatSeminarDate(date, options = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const text = new Intl.DateTimeFormat('es-CL', { timeZone: TIMEZONE, ...options }).format(new Date(date))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function seminarDayParts(date) {
  const d = new Date(date)
  return {
    day: new Intl.DateTimeFormat('es-CL', { timeZone: TIMEZONE, day: 'numeric' }).format(d),
    month: new Intl.DateTimeFormat('es-CL', { timeZone: TIMEZONE, month: 'short' }).format(d).replace('.', ''),
    weekday: new Intl.DateTimeFormat('es-CL', { timeZone: TIMEZONE, weekday: 'short' }).format(d).replace('.', ''),
  }
}

export function seminarTimeLabel(s) {
  if (s.startTime) return s.endTime ? `${s.startTime} a ${s.endTime} h` : `${s.startTime} h`
  return s.scheduleNote || 'Horario por confirmar'
}

export function seatsLeft(s) {
  return Math.max(0, s.capacity - s.seatsTaken)
}

const addDays = (key, n) => {
  const d = dateFromKey(key)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// Inicio y fin del evento para Google Calendar (todo el día si no tiene hora).
export function eventTimes(s) {
  const key = dateKey(s.date)
  if (!s.startTime) return { allDay: true, start: key, end: addDays(key, 1) }
  const [h, m] = s.startTime.split(':').map(Number)
  const end = s.endTime || `${String(Math.min(23, h + 3)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return { allDay: false, start: `${key}T${s.startTime}:00`, end: `${key}T${end}:00` }
}

// Link "Agregar a Google Calendar" para el asistente (no requiere conexión con Google).
export function googleCalendarLink(s, siteUrl = '') {
  const t = eventTimes(s)
  const compact = (v) => v.replace(/[-:]/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${s.title} · DASHU`,
    dates: `${compact(t.start)}/${compact(t.end)}`,
    ctz: TIMEZONE,
    location: [s.venue, s.address, s.city].filter(Boolean).join(', '),
    details: `${s.summary || ''}${siteUrl ? `\n\n${siteUrl}/capacitaciones/${s.slug}` : ''}`.trim(),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const phone = z.string().trim().refine((v) => {
  const n = v.replace(/\D/g, '').length
  return n >= 8 && n <= 12
}, 'Ingresa un teléfono válido')

export const enrollmentSchema = z.object({
  name: z.string().trim().min(3, 'Ingresa tu nombre y apellido').max(80),
  email: z.string().trim().toLowerCase().email('Ingresa un email válido').max(120),
  phone,
  rut: z.string().trim().max(15).optional().default('').refine((v) => !v || isValidRut(v), 'RUT no válido'),
  business: z.string().trim().max(120).optional().default(''),
  notes: z.string().trim().max(300).optional().default(''),
})

export const distributorLeadSchema = z.object({
  name: z.string().trim().min(3, 'Ingresa tu nombre y apellido').max(80),
  email: z.string().trim().toLowerCase().email('Ingresa un email válido').max(120),
  phone,
  business: z.string().trim().min(2, 'Ingresa el nombre de tu barbería o negocio').max(120),
  rut: z.string().trim().max(15).optional().default('').refine((v) => !v || isValidRut(v), 'RUT no válido'),
  region: z.string().refine((r) => REGION_NAMES.includes(r), 'Selecciona tu región'),
  city: z.string().trim().min(2, 'Ingresa tu comuna o ciudad').max(80),
  boxes: z.coerce.number().int().min(1).max(100),
  message: z.string().trim().max(1000).optional().default(''),
})
