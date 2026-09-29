import { Resend } from 'resend'
import { STORE } from '../shared/store.js'
import { formatCLP, packLabelLong } from '../shared/pricing.js'
import { courierName } from '../shared/shipping.js'

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
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4efe7;font-family:Helvetica,Arial,sans-serif;color:#0b1220">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-weight:900;letter-spacing:4px;font-size:20px">${esc(STORE.wordmark)} <span style="font-weight:400;letter-spacing:3px;font-size:13px;color:#8a6a3b">${esc(STORE.wordmarkSuffix)}</span></div>
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
    <tr><td style="padding:10px 0;font-weight:700;border-top:2px solid #0b1220">Total</td><td style="text-align:right;font-weight:700;border-top:2px solid #0b1220">${formatCLP(order.total)}</td></tr>
  </table>`
}

function button(href, label) {
  return `<a href="${esc(href)}" style="display:inline-block;background:#0b1220;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px">${esc(label)}</a>`
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
