import { Resend } from 'resend'
import { STORE, DISTRIBUTOR, DISTRIBUTOR_MIN_UNITS, DISTRIBUTOR_MIN_TOTAL } from '../shared/store.js'
import { formatCLP, packLabelLong } from '../shared/pricing.js'
import { courierName } from '../shared/shipping.js'
import { TIMEZONE, seminarTimeLabel, googleCalendarLink } from '../shared/seminars.js'

let client = null

function resend() {
  if (!process.env.RESEND_API_KEY) return null
  client ||= new Resend(process.env.RESEND_API_KEY)
  return client
}

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const site = () => (process.env.PUBLIC_SITE_URL || STORE.url).replace(/\/$/, '')

async function send(to, subject, html) {
  const api = resend()
  if (!api || !to) {
    console.info('[email] omitido (RESEND_API_KEY o destinatario faltante):', subject)
    return
  }
  try {
    const { error } = await api.emails.send({
      from: process.env.EMAIL_FROM || `${STORE.name} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    })
    if (error) console.error('[email] error', subject, error)
  } catch (error) {
    console.error('[email] error', subject, error.message)
  }
}

function layout(title, content) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#fbf6f2;font-family:Helvetica,Arial,sans-serif;color:#171210">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-weight:900;letter-spacing:4px;font-size:20px">${esc(STORE.wordmark)} <span style="font-weight:400;letter-spacing:3px;font-size:13px;color:#7c5638">${esc(STORE.wordmarkSuffix)}</span></div>
    <div style="background:#ffffff;border-radius:16px;padding:28px;margin-top:20px">
      <h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
      ${content}
    </div>
    <p style="font-size:11px;color:#6b7080;margin-top:20px;line-height:1.5">${esc(STORE.legalNotice)}</p>
  </div></body></html>`
}

function itemsTable(order) {
  const rows = order.items.map((i) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.title)}<br><span style="color:#6b7080;font-size:12px">${esc(packLabelLong(i.packUnits))} × ${i.quantity}</span></td>
    <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatCLP(i.lineTotal)}</td></tr>`).join('')
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">${rows}
    <tr><td style="padding:6px 0;color:#6b7080">Envío</td><td style="text-align:right">${order.shippingCost ? formatCLP(order.shippingCost) : 'Gratis'}</td></tr>
    ${order.discount ? `<tr><td style="padding:6px 0;color:#1f7a4d">Descuento ${esc(order.couponCode)}</td><td style="text-align:right;color:#1f7a4d">-${formatCLP(order.discount)}</td></tr>` : ''}
    <tr><td style="padding:10px 0;font-weight:700;border-top:2px solid #171210">Total</td><td style="text-align:right;font-weight:700;border-top:2px solid #171210">${formatCLP(order.total)}</td></tr>
  </table>`
}

function button(href, label) {
  return `<a href="${esc(href)}" style="display:inline-block;background:#171210;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px">${esc(label)}</a>`
}

const orderLink = (order) => `${site()}/pedido/${order.orderNumber}?t=${order.accessToken}`

export async function notifyOrderPaid(order) {
  await send(order.customerEmail, `Pago confirmado · Pedido ${order.orderNumber}`, layout('¡Gracias por tu compra!', `
    <p style="line-height:1.6">Hola ${esc(order.customerName.split(' ')[0])}, confirmamos el pago de tu pedido <strong>${esc(order.orderNumber)}</strong>. Te avisaremos por este medio cuando salga a despacho.</p>
    ${itemsTable(order)}
    <p style="font-size:13px;color:#6b7080">Despacho a: ${esc(order.shippingAddress)}, ${esc(order.shippingCommune)}, ${esc(order.shippingRegion)}</p>
    ${button(orderLink(order), 'Seguir mi pedido')}`))

  await send(process.env.ADMIN_EMAIL, `Nueva venta ${order.orderNumber} · ${formatCLP(order.total)}`, layout('Nueva venta pagada', `
    <p><strong>${esc(order.customerName)}</strong> · ${esc(order.customerEmail)} · ${esc(order.customerPhone)}</p>
    <p style="font-size:13px">${esc(order.shippingAddress)}, ${esc(order.shippingCommune)}, ${esc(order.shippingRegion)}</p>
    <p style="font-size:13px">Documento: ${order.documentType === 'factura' ? `Factura · ${esc(order.businessName)} · ${esc(order.customerRut)} · ${esc(order.businessActivity)}` : 'Boleta'}</p>
    ${itemsTable(order)}
    ${button(`${site()}/admin/pedidos/${order.id}`, 'Abrir en el admin')}`))
}

export async function notifyOrderShipped(order) {
  const courier = courierName(order.courier)
  await send(order.customerEmail, `Tu pedido ${order.orderNumber} va en camino`, layout('Tu pedido va en camino 🚚', `
    <p style="line-height:1.6">Entregamos tu pedido a <strong>${esc(courier)}</strong>.${order.trackingNumber ? ` Tu número de seguimiento es <strong>${esc(order.trackingNumber)}</strong>.` : ''}</p>
    ${order.trackingUrl ? `<p>${button(order.trackingUrl, `Seguir en ${courier}`)}</p>` : ''}
    <p style="font-size:13px;color:#6b7080">También puedes ver el estado en ${`<a href="${esc(orderLink(order))}">nuestra página de seguimiento</a>`}.</p>`))
}

export async function notifyOrderDelivered(order) {
  await send(order.customerEmail, `Pedido ${order.orderNumber} entregado`, layout('¡Tu pedido fue entregado!', `
    <p style="line-height:1.6">Esperamos que disfrutes tus productos. Si tienes un minuto, cuéntanos cómo te fue: tu reseña ayuda a otros clientes.</p>
    ${button(`${site()}/#resenas`, 'Dejar una reseña')}`))
}

export async function notifyContactMessage(message) {
  await send(process.env.ADMIN_EMAIL, `Nuevo mensaje: ${message.subject || 'Contacto'}`, layout('Nuevo mensaje de contacto', `
    <p><strong>${esc(message.name)}</strong> · ${esc(message.email)}${message.phone ? ` · ${esc(message.phone)}` : ''}</p>
    <p style="white-space:pre-line;line-height:1.6">${esc(message.message)}</p>`))
}

// ---------- Capacitaciones ----------

const seminarLink = (e) => `${site()}/inscripcion/${e.code}?t=${e.accessToken}`

function seminarBlock(s) {
  const when = new Intl.DateTimeFormat('es-CL', { timeZone: TIMEZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(s.date))
  return `<table style="width:100%;font-size:14px;margin:16px 0;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#6b5e57;width:90px">Qué</td><td><strong>${esc(s.title)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#6b5e57">Cuándo</td><td>${esc(when)} · ${esc(seminarTimeLabel(s))}</td></tr>
    <tr><td style="padding:6px 0;color:#6b5e57">Dónde</td><td>${esc([s.venue, s.address, s.city].filter(Boolean).join(', '))}</td></tr>
    ${s.host ? `<tr><td style="padding:6px 0;color:#6b5e57">Con</td><td>${esc(s.host)}</td></tr>` : ''}
  </table>`
}

export async function notifyEnrollmentConfirmed(e) {
  const s = e.seminar
  await send(e.email, `Cupo confirmado · ${s.title}`, layout('¡Tu cupo está confirmado!', `
    <p style="line-height:1.6">Hola ${esc(e.name.split(' ')[0])}, ya estás inscrito. Tu código de inscripción es <strong>${esc(e.code)}</strong>.</p>
    ${seminarBlock(s)}
    <p>${button(googleCalendarLink(s, site()), 'Agregar a mi Google Calendar')}</p>
    <p style="font-size:13px;color:#6b5e57">Detalles y cambios de tu inscripción: <a href="${esc(seminarLink(e))}">ver mi inscripción</a>.</p>`))
  await send(process.env.ADMIN_EMAIL, `Nueva inscripción · ${s.title} (${s.city})`, layout('Nueva inscripción pagada', `
    <p><strong>${esc(e.name)}</strong> · ${esc(e.email)} · ${esc(e.phone)}${e.business ? ` · ${esc(e.business)}` : ''}</p>
    ${seminarBlock(s)}
    <p>Monto: ${e.amount ? formatCLP(e.amount) : '—'} (${esc(e.paymentMethod || '')})</p>
    ${button(`${site()}/admin/capacitaciones/${s.id}`, 'Ver inscritos')}`))
}

export async function notifyEnrollmentReceived(e) {
  const s = e.seminar
  await send(e.email, `Pre-inscripción recibida · ${s.title}`, layout('Recibimos tu pre-inscripción', `
    <p style="line-height:1.6">Hola ${esc(e.name.split(' ')[0])}, te avisaremos apenas se confirme el valor y la forma de pago para asegurar tu cupo.</p>
    ${seminarBlock(s)}
    <p style="font-size:13px;color:#6b5e57">Tu código: <strong>${esc(e.code)}</strong> · <a href="${esc(seminarLink(e))}">ver mi pre-inscripción</a></p>`))
  await send(process.env.ADMIN_EMAIL, `Pre-inscripción · ${s.title} (${s.city})`, layout('Nueva pre-inscripción', `
    <p><strong>${esc(e.name)}</strong> · ${esc(e.email)} · ${esc(e.phone)}</p>${seminarBlock(s)}`))
}

// ---------- Distribuidores ----------

export async function notifyDistributorLead(lead) {
  const req = `${DISTRIBUTOR.minBoxes} embalajes de ${DISTRIBUTOR.unitsPerBox} cremas (${DISTRIBUTOR_MIN_UNITS} unidades) por ${formatCLP(DISTRIBUTOR_MIN_TOTAL)}`
  await send(lead.email, 'Recibimos tu solicitud para ser distribuidor DASHU', layout('¡Gracias por tu interés!', `
    <p style="line-height:1.6">Hola ${esc(lead.name.split(' ')[0])}, recibimos tu solicitud para ser distribuidor de DASHU Down Permanent.</p>
    <div style="background:#faeee8;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0 0 6px;font-weight:700">Requisito para ser distribuidor</p>
      <p style="margin:0;line-height:1.6">La compra mínima es de <strong>${req}</strong>. Cada crema te queda a <strong>${formatCLP(DISTRIBUTOR.unitCost)}</strong>.</p>
    </div>
    <p style="line-height:1.6">Te contactaremos a la brevedad para coordinar el pedido y el despacho.</p>`))
  await send(process.env.ADMIN_EMAIL, `Postulación distribuidor · ${lead.business} (${lead.city})`, layout('Nueva postulación de distribuidor', `
    <p><strong>${esc(lead.name)}</strong> · ${esc(lead.email)} · ${esc(lead.phone)}</p>
    <p>${esc(lead.business)}${lead.rut ? ` · RUT ${esc(lead.rut)}` : ''} · ${esc(lead.city)}, ${esc(lead.region)}</p>
    <p>Embalajes que quiere: <strong>${lead.boxes}</strong> (${lead.boxes * DISTRIBUTOR.unitsPerBox} cremas · ${formatCLP(lead.boxes * DISTRIBUTOR.unitsPerBox * DISTRIBUTOR.unitCost)})</p>
    ${lead.message ? `<p style="white-space:pre-line">${esc(lead.message)}</p>` : ''}
    ${button(`${site()}/admin/distribuidores`, 'Ver postulaciones')}`))
}
