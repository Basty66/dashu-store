import { prisma } from '../../lib/config/prisma.js'
import { resend, ADMIN_EMAIL, FROM_EMAIL } from '../../lib/config/resend.js'

function sendEmails(order, lowStockItems, method) {
  const itemsHtml = (order.items || []).map(i =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 0;text-align:center">${i.quantity}</td><td style="padding:8px 0;text-align:right">$${((i.price * i.quantity) * 1000).toLocaleString('es-CL')}</td></tr>`
  ).join('')
  const totalFmt = `$${(order.total * 1000).toLocaleString('es-CL')}`

  resend.emails.send({
    from: FROM_EMAIL, to: order.customerEmail,
    subject: `Compra confirmada — ${order.orderNumber}`,
    html: `<div style="max-width:560px;margin:0 auto;font-family:Inter,sans-serif;color:#0F2038">
      <div style="text-align:center;padding:32px 0;border-bottom:2px solid #0F2038">
        <h1 style="font-size:28px;font-weight:900;letter-spacing:2px;margin:0">DASHU</h1>
        <p style="font-size:14px;font-weight:300;letter-spacing:1px;margin:0">FOR MEN</p></div>
      <div style="padding:32px 0">
        <h2 style="font-size:20px;margin:0 0 8px">¡Gracias por tu compra!</h2>
        <p style="color:#44474d;margin:0 0 24px">Hemos recibido tu pago y estamos preparando tu pedido.</p>
        <div style="background:#fff8f5;border-radius:8px;padding:20px;margin-bottom:24px">
          <p style="font-size:12px;color:#75777e;margin:0 0 4px">N° DE PEDIDO</p>
          <p style="font-size:16px;font-weight:600;margin:0">${order.orderNumber}</p></div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead><tr><th style="text-align:left;font-size:12px;color:#75777e;padding-bottom:8px">Producto</th><th style="text-align:center;font-size:12px;color:#75777e">Cant</th><th style="text-align:right;font-size:12px;color:#75777e">Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody></table>
        <div style="border-top:2px solid #0F2038;padding-top:12px;text-align:right;font-size:18px;font-weight:700">${totalFmt}</div></div>
      <div style="border-top:1px solid #eee;padding:16px 0;text-align:center;font-size:12px;color:#75777e">DASHU FOR MEN</div></div>`,
  }).catch(() => {})

  if (lowStockItems?.length > 0) {
    resend.emails.send({
      from: FROM_EMAIL, to: ADMIN_EMAIL,
      subject: `Nueva venta — ${order.orderNumber} — ${totalFmt}`,
      html: `<div style="max-width:560px;font-family:Inter,sans-serif">
        <h2>🛒 Nueva venta (${method})</h2>
        <p><strong>Pedido:</strong> ${order.orderNumber}</p>
        <p><strong>Cliente:</strong> ${order.customerName} — ${order.customerEmail}</p>
        <p><strong>Total:</strong> ${totalFmt}</p>
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-top:16px">
          <h4 style="margin:0 0 8px;color:#856404">⚠️ Alerta de Stock Bajo</h4>
          ${lowStockItems.map(p => `<p style="margin:2px 0;font-size:14px;color:#856404">${p.title} — Stock: ${p.stock}</p>`).join('')}</div></div>`,
    }).catch(() => {})
  } else {
    resend.emails.send({
      from: FROM_EMAIL, to: ADMIN_EMAIL,
      subject: `Nueva venta — ${order.orderNumber} — ${totalFmt}`,
      html: `<div style="max-width:560px;font-family:Inter,sans-serif">
        <h2>🛒 Nueva venta (${method})</h2>
        <p><strong>Pedido:</strong> ${order.orderNumber}</p>
        <p><strong>Cliente:</strong> ${order.customerName} — ${order.customerEmail}</p>
        <p><strong>Total:</strong> ${totalFmt}</p></div>`,
    }).catch(() => {})
  }
}

async function revertStock(tx, items) {
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } })
    if (!product) continue
    await tx.product.update({ where: { id: item.productId }, data: { stock: product.stock + item.quantity } })
  }
}

async function confirmOrder(tx, order) {
  const updated = await tx.order.update({ where: { id: order.id }, data: { status: 'Pagada' }, include: { items: true } })
  if (order.couponCode) {
    await tx.coupon.updateMany({ where: { code: order.couponCode, isActive: true }, data: { usedCount: { increment: 1 } } })
  }
  const lowStock = []
  for (const item of order.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } })
    if (!product) continue
    if (product.stock < 3) lowStock.push({ title: product.title, stock: product.stock })
  }
  return [updated, lowStock]
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  const { pathname } = new URL(req.url, 'http://localhost')
  const segment = pathname.replace(/^\/api\/webhooks\/?/, '').split('/')[0]

  if (req.method === 'OPTIONS') return res.status(200).end()

  // Webpay Plus return (GET redirect from Transbank)
  if (segment === 'webpay' && req.method === 'GET') {
    const { token_ws } = req.query
    if (!token_ws) return res.writeHead(302, { Location: '/checkout?error=missing_token' }).end()

    try {
      const WEBPAY_URL = process.env.WEBPAY_ENVIRONMENT === 'production' ? 'https://webpay3g.transbank.cl' : 'https://webpay3gint.transbank.cl'
      const auth = Buffer.from(`${process.env.WEBPAY_COMMERCE_CODE}:${process.env.WEBPAY_API_KEY}`).toString('base64')
      const confirmRes = await fetch(`${WEBPAY_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`, { headers: { Authorization: `Basic ${auth}` } })
      const data = await confirmRes.json()
      if (data.status !== 'AUTHORIZED') {
        const failedOrder = await prisma.order.findFirst({ where: { paymentId: token_ws }, include: { items: true } })
        if (failedOrder && failedOrder.status !== 'Pagada') {
          await prisma.$transaction(async (tx) => {
            await revertStock(tx, failedOrder.items)
            await tx.order.update({ where: { id: failedOrder.id }, data: { status: 'Rechazado' } })
          })
        }
        return res.writeHead(302, { Location: '/checkout?error=rejected' }).end()
      }
      const order = await prisma.order.findFirst({ where: { paymentId: token_ws }, include: { items: true } })
      if (!order) return res.writeHead(302, { Location: '/checkout?error=not_found' }).end()
      if (order.status === 'Pagada') return res.writeHead(302, { Location: `/order/${order.orderNumber}?success=true` }).end()

      const [updatedOrder, lowStockItems] = await prisma.$transaction(async (tx) => {
        return await confirmOrder(tx, order)
      })
      sendEmails(order, lowStockItems, 'Webpay Plus')
      return res.writeHead(302, { Location: `/order/${order.orderNumber}?success=true` }).end()
    } catch (error) {
      try {
        const failedOrder = await prisma.order.findFirst({ where: { paymentId: token_ws }, include: { items: true } })
        if (failedOrder && failedOrder.status !== 'Pagada') {
          await prisma.$transaction(async (tx) => {
            await revertStock(tx, failedOrder.items)
            await tx.order.update({ where: { id: failedOrder.id }, data: { status: 'Rechazado' } })
          })
        }
      } catch {}
      return res.writeHead(302, { Location: `/checkout?error=${encodeURIComponent(error.message)}` }).end()
    }
  }

  // Mercado Pago webhook
  if (segment === 'mercadopago' && req.method === 'POST') {
    try {
      const { action, data } = req.body
      if (action !== 'payment.created' && action !== 'payment.updated') return res.status(200).end()
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      })
      const payment = await mpRes.json()
      const order = await prisma.order.findFirst({ where: { orderNumber: payment.external_reference }, include: { items: true } })
      if (!order || order.status === 'Pagada') return res.status(200).end()

      if (payment.status !== 'approved') {
        await prisma.$transaction(async (tx) => {
          await revertStock(tx, order.items)
          await tx.order.update({ where: { id: order.id }, data: { status: 'Rechazado' } })
        })
        return res.status(200).end()
      }

      const [updatedOrder, lowStockItems] = await prisma.$transaction(async (tx) => {
        return await confirmOrder(tx, order)
      })
      sendEmails(order, lowStockItems, 'Mercado Pago')
      return res.status(200).json({ ok: true })
    } catch (error) {
      try {
        if (req.body?.data?.id) {
          const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${req.body.data.id}`, { headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` } })
          const payment = await mpRes.json()
          if (payment.external_reference) {
            const failedOrder = await prisma.order.findFirst({ where: { orderNumber: payment.external_reference }, include: { items: true } })
            if (failedOrder && failedOrder.status !== 'Pagada') {
              await prisma.$transaction(async (tx) => {
                await revertStock(tx, failedOrder.items)
                await tx.order.update({ where: { id: failedOrder.id }, data: { status: 'Rechazado' } })
              })
            }
          }
        }
      } catch {}
      return res.status(200).json({ ok: false })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
