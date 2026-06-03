import { prisma } from '../config/prisma.js'
import { resend, ADMIN_EMAIL, FROM_EMAIL } from '../config/resend.js'

const WEBPAY_URL = process.env.WEBPAY_ENVIRONMENT === 'production'
  ? 'https://webpay3g.transbank.cl'
  : 'https://webpay3gint.transbank.cl'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { token_ws } = req.query
    if (!token_ws) {
      return res.writeHead(302, { Location: '/checkout?error=missing_token' }).end()
    }

    try {
      const token = Buffer.from(
        `${process.env.WEBPAY_COMMERCE_CODE}:${process.env.WEBPAY_API_KEY}`
      ).toString('base64')

      const confirmRes = await fetch(
        `${WEBPAY_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`,
        { headers: { Authorization: `Basic ${token}` } }
      )
      const data = await confirmRes.json()

      if (data.status !== 'AUTHORIZED') {
        await prisma.order.updateMany({
          where: { paymentId: token_ws },
          data: { status: 'Rechazado' },
        })
        return res.writeHead(302, { Location: '/checkout?error=rejected' }).end()
      }

      const order = await prisma.order.findFirst({
        where: { paymentId: token_ws },
        include: { items: true },
      })

      if (!order) return res.writeHead(302, { Location: '/checkout?error=not_found' }).end()

      if (order.couponCode) {
        await prisma.coupon.updateMany({
          where: { code: order.couponCode, isActive: true },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Transaction: update order + reduce stock + check low stock
      const [updatedOrder, lowStockItems] = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: order.id },
          data: { status: 'Pagada' },
          include: { items: true },
        })

        const lowStock = []
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product) continue
          const newStock = product.stock - item.quantity
          if (newStock < 0) {
            throw new Error(`Stock insuficiente para "${product.title}" — disponible: ${product.stock}, solicitado: ${item.quantity}`)
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          })
          if (newStock < 3) {
            lowStock.push({ title: product.title, stock: newStock })
          }
        }
        return [updated, lowStock]
      })

      // Emails via Resend
      const itemsHtml = order.items.map(i =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 0;text-align:center">${i.quantity}</td><td style="padding:8px 0;text-align:right">$${((i.price * i.quantity) * 1000).toLocaleString('es-CL')}</td></tr>`
      ).join('')

      const totalFmt = `$${(order.total * 1000).toLocaleString('es-CL')}`

      // Email to customer
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.customerEmail,
        subject: `Compra confirmada — ${order.orderNumber}`,
        html: `
          <div style="max-width:560px;margin:0 auto;font-family:Inter,sans-serif;color:#0F2038">
            <div style="text-align:center;padding:32px 0;border-bottom:2px solid #0F2038">
              <h1 style="font-size:28px;font-weight:900;letter-spacing:2px;margin:0">DASHU</h1>
              <p style="font-size:14px;font-weight:300;letter-spacing:1px;margin:0">FOR MEN</p>
            </div>
            <div style="padding:32px 0">
              <h2 style="font-size:20px;margin:0 0 8px">¡Gracias por tu compra!</h2>
              <p style="color:#44474d;margin:0 0 24px">Hemos recibido tu pago y estamos preparando tu pedido.</p>
              <div style="background:#fff8f5;border-radius:8px;padding:20px;margin-bottom:24px">
                <p style="font-size:12px;color:#75777e;margin:0 0 4px">N° DE PEDIDO</p>
                <p style="font-size:16px;font-weight:600;margin:0">${order.orderNumber}</p>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <thead><tr><th style="text-align:left;font-size:12px;color:#75777e;padding-bottom:8px">Producto</th><th style="text-align:center;font-size:12px;color:#75777e">Cant</th><th style="text-align:right;font-size:12px;color:#75777e">Total</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="border-top:2px solid #0F2038;padding-top:12px;text-align:right;font-size:18px;font-weight:700">${totalFmt}</div>
            </div>
            <div style="border-top:1px solid #eee;padding:16px 0;text-align:center;font-size:12px;color:#75777e">
              DASHU FOR MEN — Protein Down Cream Korea
            </div>
          </div>
        `,
      })

      // Build admin alert
      let adminExtra = ''
      if (lowStockItems.length > 0) {
        adminExtra = `
          <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-top:16px">
            <h4 style="margin:0 0 8px;color:#856404">⚠️ Alerta de Stock Bajo</h4>
            ${lowStockItems.map(p => `<p style="margin:2px 0;font-size:14px;color:#856404">${p.title} — Stock: ${p.stock} unidades restantes</p>`).join('')}
          </div>
        `
      }

      // Email to admin
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva venta — ${order.orderNumber} — ${totalFmt}`,
        html: `
          <div style="max-width:560px;font-family:Inter,sans-serif">
            <h2>🛒 Nueva venta realizada</h2>
            <p><strong>Pedido:</strong> ${order.orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.customerName} — ${order.customerEmail}</p>
            <p><strong>Total:</strong> ${totalFmt}</p>
            <p><strong>Método:</strong> Webpay Plus</p>
            ${adminExtra}
          </div>
        `,
      })

      return res.writeHead(302, {
        Location: `/order/${order.orderNumber}?success=true`,
      }).end()
    } catch (error) {
      try {
        await prisma.order.updateMany({ where: { paymentId: req.query.token_ws || '' }, data: { status: 'Rechazado' } })
      } catch {}
      return res.writeHead(302, { Location: `/checkout?error=${encodeURIComponent(error.message)}` }).end()
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
