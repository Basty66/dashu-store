import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dateFromKey, dateKey, eventTimes, googleCalendarLink, seatsLeft, enrollmentSchema, distributorLeadSchema, seminarTimeLabel } from '../shared/seminars.js'
import { DISTRIBUTOR_MIN_UNITS, DISTRIBUTOR_MIN_TOTAL } from '../shared/store.js'
import { buildCalendarEvent } from '../lib/google.js'

const seminar = {
  slug: 'seminario-alisado-antofagasta-am',
  title: 'Seminario de alisado',
  kind: 'seminario',
  city: 'Antofagasta',
  venue: 'Bemol Barbería',
  address: '',
  host: 'Bemol Barbería con Angelito',
  summary: 'Bloque de la mañana',
  date: dateFromKey('2026-11-22'),
  startTime: null,
  endTime: null,
  scheduleNote: 'Bloque AM',
  price: 45000,
  capacity: 12,
  seatsTaken: 5,
  isCancelled: false,
}

test('las fechas se mantienen en el mismo día en Chile (verano e invierno)', () => {
  assert.equal(dateKey(dateFromKey('2026-11-22')), '2026-11-22')
  assert.equal(dateKey(dateFromKey('2026-06-15')), '2026-06-15')
  assert.equal(dateKey(dateFromKey('2027-01-01')), '2027-01-01')
})

test('evento sin hora es de día completo; con hora usa inicio y término', () => {
  assert.deepEqual(eventTimes(seminar), { allDay: true, start: '2026-11-22', end: '2026-11-23' })
  assert.deepEqual(eventTimes({ ...seminar, startTime: '10:00', endTime: '13:30' }), { allDay: false, start: '2026-11-22T10:00:00', end: '2026-11-22T13:30:00' })
  assert.equal(eventTimes({ ...seminar, startTime: '15:00' }).end, '2026-11-22T18:00:00')
  assert.equal(seminarTimeLabel(seminar), 'Bloque AM')
})

test('link para agregar a Google Calendar', () => {
  const url = new URL(googleCalendarLink(seminar, 'https://dashu-store.vercel.app'))
  assert.equal(url.hostname, 'calendar.google.com')
  assert.equal(url.searchParams.get('dates'), '20261122/20261123')
  assert.equal(url.searchParams.get('ctz'), 'America/Santiago')
  assert.match(url.searchParams.get('details'), /capacitaciones\/seminario-alisado-antofagasta-am/)
})

test('cupos disponibles', () => {
  assert.equal(seatsLeft(seminar), 7)
  assert.equal(seatsLeft({ capacity: 3, seatsTaken: 5 }), 0)
})

test('evento de Google Calendar: privado, sin invitados y con la lista de inscritos', () => {
  const enrollments = [
    { status: 'PAGADO', name: 'Juan Pérez', phone: '+56911111111', email: 'juan@example.com', business: 'Imperio Barber' },
    { status: 'PREINSCRITO', name: 'Ana Soto', phone: '+56922222222', email: 'ana@example.com' },
    { status: 'PENDIENTE_PAGO', name: 'Luis Rojas', phone: '+56933333333', email: 'luis@example.com' },
  ]
  const event = buildCalendarEvent(seminar, enrollments, 'https://x.cl/admin/capacitaciones/1')
  assert.equal(event.summary, 'Seminario de alisado · Antofagasta')
  assert.deepEqual(event.start, { date: '2026-11-22' })
  assert.equal(event.visibility, 'private')
  assert.equal(event.attendees, undefined)
  assert.match(event.description, /INSCRITOS PAGADOS \(1\/12\)/)
  assert.match(event.description, /Juan Pérez · \+56911111111 · juan@example.com · Imperio Barber/)
  assert.match(event.description, /PRE-INSCRITOS \(1\)/)
  assert.match(event.description, /Esperando pago: 1/)
  assert.equal(buildCalendarEvent({ ...seminar, isCancelled: true }, [], '').status, 'cancelled')
})

test('validación de inscripción y postulación de distribuidor', () => {
  assert.equal(enrollmentSchema.safeParse({ name: 'Juan Pérez', email: 'JUAN@x.cl', phone: '912345678' }).success, true)
  assert.equal(enrollmentSchema.safeParse({ name: 'J', email: 'no', phone: '1' }).success, false)
  assert.equal(enrollmentSchema.safeParse({ name: 'Juan Pérez', email: 'j@x.cl', phone: '912345678', rut: '12.345.678-9' }).success, false)
  const lead = distributorLeadSchema.parse({ name: 'Ana Soto', email: 'a@x.cl', phone: '+56 9 1234 5678', business: 'Barbería X', region: 'Antofagasta', city: 'Calama', boxes: '3' })
  assert.equal(lead.boxes, 3)
})

test('programa de distribuidores: 3 embalajes de 30 a $19.000', () => {
  assert.equal(DISTRIBUTOR_MIN_UNITS, 90)
  assert.equal(DISTRIBUTOR_MIN_TOTAL, 1710000)
})
