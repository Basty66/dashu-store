import { prisma } from '../config/prisma.js'
import { resend, ADMIN_EMAIL, FROM_EMAIL } from '../config/resend.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body
      if (action !== 'payment.created' && action !== 'payment.updated') {
        return res.status(200).end()
      }

      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-5982763513720360-042822-a60ff03adf36b09df3c6c39ea5b891e0-1487341213'}`,
          },
        }
      )
      const payment = await mpRes.json()

      if (payment.status !== 'approved') {
        return res.status(200).end()
      }

      const order = await prisma.order.findFirst({
        where: { orderNumber: payment.external_reference },
        include: { items: true },
      })

      if (!order || order.status === 'Pagada') return res.status(200).end()

      if (order.couponCode) {
        await prisma.coupon.updateMany({
          where: { code: order.couponCode, isActive: true },
          data: { usedCount: { increment: 1 } },
        })
      }

      const [updatedOrder, lowStockItems] = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'Pagada',
            paymentId: String(data.id),
          },
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

      const itemsHtml = order.items.map(i =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 0;text-align:center">${i.quantity}</td><td style="padding:8px 0;text-align:right">$${((i.price * i.quantity) * 1000).toLocaleString('es-CL')}</td></tr>`
      ).join('')

      const totalFmt = `$${(order.total * 1000).toLocaleString('es-CL')}`

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
            <div style="border-top:1px solid #eee;padding:16px 0;text-align:center;font-size:12px;color:#75777e">DASHU FOR MEN</div>
          </div>
        `,
      })

      let adminExtra = ''
      if (lowStockItems.length > 0) {
        adminExtra = `
          <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-top:16px">
            <h4 style="margin:0 0 8px;color:#856404">⚠️ Alerta de Stock Bajo</h4>
            ${lowStockItems.map(p => `<p style="margin:2px 0;font-size:14px;color:#856404">${p.title} — Stock: ${p.stock} unidades</p>`).join('')}
          </div>
        `
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva venta — ${order.orderNumber} — ${totalFmt}`,
        html: `
          <div style="max-width:560px;font-family:Inter,sans-serif">
            <h2>🛒 Nueva venta (Mercado Pago)</h2>
            <p><strong>Pedido:</strong> ${order.orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.customerName} — ${order.customerEmail}</p>
            <p><strong>Total:</strong> ${totalFmt}</p>
            ${adminExtra}
          </div>
        `,
      })

      return res.status(200).json({ ok: true })
    } catch (error) {
      try {
        const paymentId = req.body?.data?.id
        if (paymentId) {
          const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-5982763513720360-042822-a60ff03adf36b09df3c6c39ea5b891e0-1487341213'}` },
          })
          const payment = await mpRes.json()
          if (payment.external_reference) {
            await prisma.order.updateMany({
              where: { orderNumber: payment.external_reference },
              data: { status: 'Rechazado' },
            })
          }
        }
      } catch {}
      return res.status(200).json({ ok: false })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
