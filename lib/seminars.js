import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from './prisma.js'
import { HttpError } from './http.js'
import { slugify } from './catalog.js'
import { upsertCalendarEvent } from './google.js'
import { notifyEnrollmentConfirmed, notifyEnrollmentReceived } from './email.js'
import { enrollmentSchema, dateFromKey, dateKey, SEMINAR_KINDS } from '../shared/seminars.js'
import { PAYMENT_WINDOW_MINUTES } from '../shared/store.js'
import { formatRut } from '../shared/rut.js'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const code = () => `SEM-${Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % 32]).join('')}`
const RESERVED_SLUGS = ['inscripcion']

// ---------- Vistas ----------

export function publicSeminar(s) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    kind: s.kind,
    summary: s.summary,
    description: s.description,
    city: s.city,
    venue: s.venue,
    address: s.address,
    host: s.host,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    scheduleNote: s.scheduleNote,
    price: s.price,
    capacity: s.capacity,
    seatsTaken: s.seatsTaken,
    image: s.image,
    isCancelled: s.isCancelled,
  }
}

export function publicEnrollment(e) {
  return {
    code: e.code,
    accessToken: e.accessToken,
    status: e.status,
    name: e.name,
    email: e.email,
    phone: e.phone,
    amount: e.amount,
    paymentStatus: e.paymentStatus,
    paidAt: e.paidAt,
    expiresAt: e.expiresAt,
    createdAt: e.createdAt,
    seminar: publicSeminar(e.seminar),
  }
}

// Un evento se muestra hasta el final de su día (se guarda a mediodía de Chile).
const upcomingWhere = () => ({ isPublished: true, date: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } })

export async function listUpcoming() {
  const seminars = await prisma.seminar.findMany({ where: upcomingWhere(), orderBy: [{ date: 'asc' }, { startTime: 'asc' }] })
  return seminars.map(publicSeminar)
}

export async function getSeminarBySlug(slug) {
  const s = await prisma.seminar.findFirst({ where: { slug, isPublished: true } })
  if (!s) throw new HttpError(404, 'Capacitación no encontrada')
  return s
}

// ---------- Cupos ----------

async function takeSeat(tx, seminarId, { force = false } = {}) {
  const taken = force
    ? await tx.$executeRaw`UPDATE "Seminar" SET "seatsTaken" = "seatsTaken" + 1 WHERE id = ${seminarId}`
    : await tx.$executeRaw`UPDATE "Seminar" SET "seatsTaken" = "seatsTaken" + 1 WHERE id = ${seminarId} AND "seatsTaken" < capacity AND "isCancelled" = false`
  return taken === 1
}

async function releaseSeat(tx, enrollmentId) {
  const flagged = await tx.enrollment.updateMany({ where: { id: enrollmentId, holdsSeat: true }, data: { holdsSeat: false } })
  if (flagged.count !== 1) return
  const { seminarId } = await tx.enrollment.findUnique({ where: { id: enrollmentId }, select: { seminarId: true } })
  await tx.$executeRaw`UPDATE "Seminar" SET "seatsTaken" = GREATEST("seatsTaken" - 1, 0) WHERE id = ${seminarId}`
}

export async function releaseExpiredEnrollments() {
  const expired = await prisma.enrollment.findMany({
    where: { status: 'PENDIENTE_PAGO', expiresAt: { lt: new Date() } },
    select: { id: true },
    take: 25,
  })
  for (const { id } of expired) {
    await prisma.$transaction(async (tx) => {
      const moved = await tx.enrollment.updateMany({ where: { id, status: 'PENDIENTE_PAGO' }, data: { status: 'EXPIRADO' } })
      if (moved.count === 1) await releaseSeat(tx, id)
    })
  }
}

// ---------- Inscripción pública ----------

export async function enroll(slug, input) {
  const data = enrollmentSchema.parse(input)
  await releaseExpiredEnrollments()
  const seminar = await getSeminarBySlug(slug)
  if (seminar.isCancelled) throw new HttpError(409, 'Esta capacitación fue cancelada')
  if (seminar.date < new Date(Date.now() - 12 * 60 * 60 * 1000)) throw new HttpError(409, 'Esta capacitación ya se realizó')

  // Evita inscripciones duplicadas: retoma la que está pendiente.
  const existing = await prisma.enrollment.findFirst({
    where: { seminarId: seminar.id, email: data.email, status: { in: ['PREINSCRITO', 'PENDIENTE_PAGO', 'PAGADO'] } },
    include: { seminar: true },
  })
  if (existing?.status === 'PAGADO') throw new HttpError(409, 'Ya tienes un cupo pagado en esta capacitación. Revisa tu email.')
  if (existing?.status === 'PENDIENTE_PAGO' || (existing?.status === 'PREINSCRITO' && seminar.price === null)) return existing

  const base = {
    code: code(),
    accessToken: crypto.randomBytes(24).toString('base64url'),
    seminarId: seminar.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    rut: data.rut ? formatRut(data.rut) : null,
    business: data.business || null,
    notes: data.notes || null,
  }

  // Sin precio definido: pre-inscripción (no ocupa cupo ni pide pago).
  if (seminar.price === null) {
    const enrollment = await prisma.enrollment.create({ data: { ...base, status: 'PREINSCRITO' }, include: { seminar: true } })
    await notifyEnrollmentReceived(enrollment)
    await syncCalendar(seminar.id)
    return enrollment
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    if (!(await takeSeat(tx, seminar.id))) throw new HttpError(409, 'No quedan cupos disponibles para esta capacitación')
    if (existing?.status === 'PREINSCRITO') {
      await tx.enrollment.update({ where: { id: existing.id }, data: { status: 'CANCELADO', notes: 'Reemplazada por inscripción con pago' } })
    }
    return tx.enrollment.create({
      data: {
        ...base,
        status: 'PENDIENTE_PAGO',
        holdsSeat: true,
        amount: seminar.price,
        paymentMethod: 'mercadopago',
        expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000),
      },
      include: { seminar: true },
    })
  })
  return enrollment
}

export async function findEnrollment(codeValue, token) {
  const number = String(codeValue || '').trim().toUpperCase()
  const current = await prisma.enrollment.findUnique({ where: { code: number }, select: { status: true, expiresAt: true } })
  if (current?.status === 'PENDIENTE_PAGO' && current.expiresAt < new Date()) await releaseExpiredEnrollments()
  const e = await prisma.enrollment.findUnique({ where: { code: number }, include: { seminar: true } })
  const ok = e && token && token.length === e.accessToken.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(e.accessToken))
  if (!ok) throw new HttpError(404, 'No encontramos esta inscripción')
  return e
}

// ---------- Cambios de estado (pago, cancelación, confirmación manual) ----------

export async function setEnrollmentStatus(id, next, { extra = {}, force = false } = {}) {
  const e = await prisma.enrollment.findUnique({ where: { id }, include: { seminar: true } })
  if (!e) throw new HttpError(404, 'Inscripción no encontrada')
  const allowed = {
    PREINSCRITO: ['PAGADO', 'CANCELADO'],
    PENDIENTE_PAGO: ['PAGADO', 'CANCELADO'],
    PAGADO: ['CANCELADO'],
    EXPIRADO: ['PAGADO', 'CANCELADO'],
    CANCELADO: [],
  }
  if (!allowed[e.status]?.includes(next)) throw new HttpError(400, 'Ese cambio de estado no está permitido')

  const updated = await prisma.$transaction(async (tx) => {
    const guard = await tx.enrollment.updateMany({ where: { id, status: e.status }, data: { status: next, ...extra, ...(next === 'PAGADO' ? { paidAt: new Date() } : {}) } })
    if (guard.count !== 1) throw new HttpError(409, 'La inscripción cambió mientras la editabas. Recarga.')
    if (next === 'CANCELADO') await releaseSeat(tx, id)
    if (next === 'PAGADO' && !e.holdsSeat) {
      if (!(await takeSeat(tx, e.seminarId, { force }))) {
        throw new HttpError(409, 'La capacitación está llena. Aumenta los cupos o confirma igual marcando "sobrecupo".')
      }
      await tx.enrollment.update({ where: { id }, data: { holdsSeat: true, amount: e.amount || e.seminar.price || 0 } })
    }
    return tx.enrollment.findUnique({ where: { id }, include: { seminar: true } })
  })

  if (next === 'PAGADO') await notifyEnrollmentConfirmed(updated)
  await syncCalendar(e.seminarId)
  return updated
}

export async function applyEnrollmentPayment(payment) {
  const e = await prisma.enrollment.findUnique({ where: { code: String(payment.external_reference || '') } })
  if (!e) return { ok: false, reason: 'enrollment_not_found' }
  if (payment.status !== 'approved') {
    if (e.status === 'PENDIENTE_PAGO') await prisma.enrollment.update({ where: { id: e.id }, data: { paymentStatus: payment.status } })
    return { ok: true, status: e.status }
  }
  if (Number(payment.transaction_amount) !== e.amount || payment.currency_id !== 'CLP') {
    console.error('[mp] Monto de inscripción no coincide', e.code, payment.transaction_amount, e.amount)
    await prisma.enrollment.update({ where: { id: e.id }, data: { paymentStatus: 'monto_no_coincide' } })
    return { ok: false, reason: 'amount_mismatch' }
  }
  if (!['PENDIENTE_PAGO', 'EXPIRADO'].includes(e.status)) return { ok: true, status: e.status }
  try {
    // Si el cupo había vencido y se llenó, igual se respeta el pago (sobrecupo) y queda anotado.
    const updated = await setEnrollmentStatus(e.id, 'PAGADO', {
      extra: { paymentStatus: 'approved', mpPaymentId: String(payment.id), paymentMethod: 'mercadopago' },
      force: true,
    })
    return { ok: true, status: updated.status }
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) return { ok: true, status: 'PAGADO' }
    throw error
  }
}

// ---------- Google Calendar ----------

export async function syncCalendar(seminarId) {
  const seminar = await prisma.seminar.findUnique({
    where: { id: seminarId },
    include: { enrollments: { where: { status: { in: ['PREINSCRITO', 'PENDIENTE_PAGO', 'PAGADO'] } }, orderBy: { createdAt: 'asc' } } },
  })
  if (!seminar) return
  const site = (process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://dashu-store.vercel.app').replace(/\/$/, '')
  try {
    const eventId = await upsertCalendarEvent(seminar, seminar.enrollments, `${site}/admin/capacitaciones/${seminar.id}`)
    if (eventId) {
      await prisma.seminar.update({ where: { id: seminarId }, data: { calendarEventId: eventId, calendarSyncedAt: new Date(), calendarError: null } })
    }
  } catch (error) {
    console.error('[google] sync', seminarId, error.message)
    await prisma.seminar.update({ where: { id: seminarId }, data: { calendarError: error.message.slice(0, 300) } })
  }
}

// ---------- Admin ----------

const timeField = z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa formato 24 h, ej: 10:00').nullable().optional().or(z.literal('').transform(() => null))

const seminarSchema = z.object({
  title: z.string().trim().min(3, 'Ingresa el nombre').max(120),
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, 'Solo minúsculas, números y guiones').optional(),
  kind: z.enum(Object.keys(SEMINAR_KINDS)),
  summary: z.string().trim().max(300).default(''),
  description: z.string().trim().max(5000).default(''),
  city: z.string().trim().min(2, 'Ingresa la ciudad').max(80),
  venue: z.string().trim().max(120).default(''),
  address: z.string().trim().max(160).default(''),
  host: z.string().trim().max(160).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida'),
  startTime: timeField,
  endTime: timeField,
  scheduleNote: z.string().trim().max(60).default(''),
  price: z.number().int().min(1, 'El valor debe ser mayor a 0').max(10_000_000).nullable(),
  capacity: z.number().int().min(1, 'Mínimo 1 cupo').max(1000),
  isPublished: z.boolean().default(true),
  isCancelled: z.boolean().default(false),
  image: z.string().max(500).nullable().optional(),
})

async function uniqueSlug(base, exceptId) {
  let slug = base || 'capacitacion'
  if (RESERVED_SLUGS.includes(slug)) slug = `${slug}-1`
  for (let i = 2; ; i++) {
    const other = await prisma.seminar.findUnique({ where: { slug } })
    if (!other || other.id === exceptId) return slug
    slug = `${base}-${i}`
  }
}

export async function saveSeminar(id, input) {
  const { date, ...data } = seminarSchema.parse(input)
  const payload = { ...data, date: dateFromKey(date) }
  payload.slug = await uniqueSlug(data.slug || slugify(`${data.title}-${data.city}-${date.slice(5)}`), id)
  if (id) {
    const current = await prisma.seminar.findUnique({ where: { id } })
    if (!current) throw new HttpError(404, 'Capacitación no encontrada')
    if (payload.capacity < current.seatsTaken) {
      throw new HttpError(400, `Ya hay ${current.seatsTaken} cupos ocupados; no puedes bajar la capacidad a ${payload.capacity}`)
    }
  }
  const seminar = id ? await prisma.seminar.update({ where: { id }, data: payload }) : await prisma.seminar.create({ data: payload })
  await syncCalendar(seminar.id)
  return prisma.seminar.findUnique({ where: { id: seminar.id } })
}

export async function adminSeminar(id) {
  await releaseExpiredEnrollments()
  const seminar = await prisma.seminar.findUnique({ where: { id }, include: { enrollments: { orderBy: { createdAt: 'desc' } } } })
  if (!seminar) throw new HttpError(404, 'Capacitación no encontrada')
  return { ...seminar, dateKey: dateKey(seminar.date) }
}

export async function adminSeminarList() {
  await releaseExpiredEnrollments()
  const seminars = await prisma.seminar.findMany({ orderBy: { date: 'asc' }, include: { enrollments: { select: { status: true, amount: true } } } })
  return seminars.map(({ enrollments, ...s }) => ({
    ...s,
    dateKey: dateKey(s.date),
    paid: enrollments.filter((e) => e.status === 'PAGADO').length,
    pending: enrollments.filter((e) => e.status === 'PENDIENTE_PAGO').length,
    preRegistered: enrollments.filter((e) => e.status === 'PREINSCRITO').length,
    revenue: enrollments.filter((e) => e.status === 'PAGADO').reduce((sum, e) => sum + e.amount, 0),
  }))
}

export async function deleteSeminar(id) {
  const active = await prisma.enrollment.count({ where: { seminarId: id, status: { in: ['PAGADO', 'PENDIENTE_PAGO', 'PREINSCRITO'] } } })
  if (active > 0) throw new HttpError(400, 'Tiene inscripciones activas: márcala como cancelada en vez de eliminarla')
  await prisma.enrollment.deleteMany({ where: { seminarId: id } })
  await prisma.seminar.delete({ where: { id } })
}

const manualSchema = enrollmentSchema.extend({ paid: z.boolean().default(true), amount: z.number().int().min(0).optional(), force: z.boolean().default(false) })

// Inscripción agregada por el admin (pago en efectivo, transferencia o invitado).
export async function addManualEnrollment(seminarId, input) {
  const data = manualSchema.parse(input)
  const seminar = await prisma.seminar.findUnique({ where: { id: seminarId } })
  if (!seminar) throw new HttpError(404, 'Capacitación no encontrada')
  const enrollment = await prisma.$transaction(async (tx) => {
    if (data.paid && !(await takeSeat(tx, seminarId, { force: data.force }))) {
      throw new HttpError(409, 'La capacitación está llena. Marca "sobrecupo" para agregarlo igual.')
    }
    return tx.enrollment.create({
      data: {
        code: code(),
        accessToken: crypto.randomBytes(24).toString('base64url'),
        seminarId,
        status: data.paid ? 'PAGADO' : 'PREINSCRITO',
        holdsSeat: data.paid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        rut: data.rut ? formatRut(data.rut) : null,
        business: data.business || null,
        notes: data.notes || 'Agregado desde el panel',
        amount: data.paid ? data.amount ?? seminar.price ?? 0 : 0,
        paymentMethod: data.paid ? 'manual' : null,
        paidAt: data.paid ? new Date() : null,
      },
      include: { seminar: true },
    })
  })
  if (enrollment.status === 'PAGADO') await notifyEnrollmentConfirmed(enrollment)
  await syncCalendar(seminarId)
  return enrollment
}
