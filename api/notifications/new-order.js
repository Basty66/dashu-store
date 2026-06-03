import { resend, ADMIN_EMAIL, FROM_EMAIL } from '../config/resend.js'

export async function notifyNewOrder(order) {
  if (!process.env.RESEND_API_KEY) {
    console.log('No RESEND_API_KEY set, skipping email notification')
    return
  }

  const itemsHtml = (order.items || []).map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${((i.price * i.quantity) * 1000).toLocaleString('es-CL')}</td></tr>`
  ).join('')

  const discountRow = order.discount > 0
    ? `<tr><td colspan="2" style="padding:8px 12px;text-align:right;color:#16a34a">Descuento (${order.couponCode})</td><td style="padding:8px 12px;text-align:right;color:#16a34a">-$${(order.discount * 1000).toLocaleString('es-CL')}</td></tr>`
    : ''

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nuevo pedido — ${order.orderNumber}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff8f5">
          <div style="border-bottom:2px solid #755841;padding-bottom:16px;margin-bottom:24px">
            <h1 style="margin:0;color:#0F2038;font-size:20px">Nuevo Pedido</h1>
            <p style="margin:4px 0 0;color:#755841;font-size:14px">${order.orderNumber}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px;width:100px">Cliente</td><td style="padding:4px 0;color:#0F2038;font-weight:600">${order.customerName}</td></tr>
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px">Email</td><td style="padding:4px 0;color:#0F2038">${order.customerEmail}</td></tr>
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px">Teléfono</td><td style="padding:4px 0;color:#0F2038">${order.customerPhone || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px">Dirección</td><td style="padding:4px 0;color:#0F2038">${order.shippingAddress || ''}, ${order.shippingCity || ''}, ${order.shippingRegion || ''}</td></tr>
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px">Método</td><td style="padding:4px 0;color:#0F2038">${order.paymentMethod || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#33353a;font-size:13px">Estado</td><td style="padding:4px 0;color:#755841">${order.status}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead><tr style="background:#0F2038;color:#fff8f5;font-size:13px"><th style="padding:8px 12px;text-align:left">Producto</th><th style="padding:8px 12px;text-align:center">Cant</th><th style="padding:8px 12px;text-align:right">Total</th></tr></thead>
            <tbody style="font-size:13px">${itemsHtml}</tbody>
            <tfoot>
              <tr><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:600">Subtotal</td><td style="padding:8px 12px;text-align:right">$${((order.total + order.discount - 4) * 1000).toLocaleString('es-CL')}</td></tr>
              <tr><td colspan="2" style="padding:8px 12px;text-align:right">Envío</td><td style="padding:8px 12px;text-align:right">$4.000</td></tr>
              ${discountRow}
              <tr style="font-weight:700;font-size:15px"><td colspan="2" style="padding:10px 12px;text-align:right;border-top:2px solid #0F2038">Total</td><td style="padding:10px 12px;text-align:right;border-top:2px solid #0F2038">$${(order.total * 1000).toLocaleString('es-CL')}</td></tr>
            </tfoot>
          </table>
          <p style="color:#33353a;font-size:12px;text-align:center;margin-top:32px">DASHU FOR MEN · <a href="${process.env.VERCEL_URL || 'http://localhost:5173'}/admin" style="color:#755841">Admin Dashboard</a></p>
        </div>
      `,
    })
    if (error) console.error('Email notification error:', error)
    else console.log('Email notification sent for', order.orderNumber, data?.id)
  } catch (e) {
    console.error('Email notification error:', e.message)
  }
}
