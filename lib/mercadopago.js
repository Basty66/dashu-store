import crypto from 'node:crypto'
import { HttpError } from './http.js'
import { STORE } from '../shared/store.js'
import { packLabelLong } from '../shared/pricing.js'

const API = 'https://api.mercadopago.com'

// 'live' con token real; 'mock' solo en desarrollo local para probar el flujo completo sin pagar.
export function paymentMode() {
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) return 'live'
  if (process.env.PAYMENTS_MOCK === '1' && process.env.VERCEL_ENV !== 'production' && process.env.VERCEL !== '1') return 'mock'
  return null
}

function token() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN
}

export async function createPreference(order, baseUrl) {
  const mode = paymentMode()
  if (!mode) {
    throw new HttpError(503, 'Los pagos en línea no están disponibles en este momento. Escríbenos por WhatsApp para completar tu compra.')
  }
  const orderUrl = `${baseUrl}/pedido/${order.orderNumber}?t=${order.accessToken}`
  if (mode === 'mock') {
    return { id: `mock-${order.orderNumber}`, url: `${baseUrl}/pago-simulado?pedido=${order.orderNumber}&t=${order.accessToken}` }
  }

  const summary = order.items.map((i) => `${i.quantity} × ${i.title} (${packLabelLong(i.packUnits)})`).join(', ')
  const isPublicHttps = baseUrl.startsWith('https://')
  const body = {
    items: [{
      id: order.orderNumber,
      title: `Pedido ${order.orderNumber} · ${STORE.name}`,
      description: summary.slice(0, 250),
      quantity: 1,
      unit_price: order.total,
      currency_id: 'CLP',
    }],
    payer: { name: order.customerName, email: order.customerEmail },
    external_reference: order.orderNumber,
    back_urls: { success: orderUrl, failure: orderUrl, pending: orderUrl },
    statement_descriptor: 'DASHU STORE',
    expires: true,
    expiration_date_to: order.expiresAt.toISOString().replace('Z', '+00:00'),
    metadata: { order_number: order.orderNumber },
    ...(isPublicHttps ? { auto_return: 'approved', notification_url: `${baseUrl}/api/webhooks/mercadopago` } : {}),
  }

  const res = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.init_point) {
    console.error('[mp] Error creando preferencia', res.status, JSON.stringify(data))
    throw new HttpError(502, 'No pudimos conectar con Mercado Pago. Intenta nuevamente en unos segundos.')
  }
  return { id: data.id, url: data.init_point }
}

export async function getPayment(paymentId) {
  if (paymentMode() !== 'live') return null
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    console.error('[mp] Error consultando pago', paymentId, res.status)
    throw new HttpError(502, 'No pudimos consultar el pago en Mercado Pago')
  }
  return res.json()
}

// Verifica la firma x-signature del webhook si MP_WEBHOOK_SECRET está configurado.
export function verifyWebhookSignature(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true
  const header = String(req.headers['x-signature'] || '')
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.trim().split('=')))
  if (!parts.ts || !parts.v1) return false
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${req.headers['x-request-id'] || ''};ts:${parts.ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return expected.length === parts.v1.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))
}
