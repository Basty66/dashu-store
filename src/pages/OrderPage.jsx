import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Clock, RefreshCw, CreditCard, Copy, MessageCircle, CheckCircle2, XCircle } from 'lucide-react'
import { formatCLP, packLabelLong } from '@shared/pricing.js'
import { api } from '../lib/api'
import { whatsappLink } from '../lib/contact'
import { toast } from '../store/toast'
import { useCart } from '../store/cart'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/atoms/Button'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState, StatusBadge } from '../components/molecules/Feedback'
import { PriceRows } from '../components/molecules/PriceRows'
import { OrderTimeline } from '../components/organisms/OrderTimeline'

function useCountdown(until) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!until) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [until])
  if (!until) return null
  const ms = Math.max(0, new Date(until).getTime() - now)
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
}

function Headline({ order }) {
  const first = order.customerName.split(' ')[0]
  const map = {
    PENDIENTE_PAGO: [Clock, 'text-warning', `${first}, tu pedido está reservado`, 'Completa el pago en Mercado Pago para confirmarlo.'],
    PAGADO: [CheckCircle2, 'text-success', `¡Gracias, ${first}! Pago confirmado`, 'Te enviamos la confirmación a tu email. Te avisaremos cuando salga a despacho.'],
    PREPARANDO: [CheckCircle2, 'text-success', 'Estamos preparando tu pedido', 'Pronto lo entregaremos al courier.'],
    ENVIADO: [CheckCircle2, 'text-success', 'Tu pedido va en camino', 'Sigue el envío con el link del courier.'],
    ENTREGADO: [CheckCircle2, 'text-success', '¡Pedido entregado!', 'Esperamos que lo disfrutes. Cuéntanos cómo te fue.'],
    CANCELADO: [XCircle, 'text-danger', 'Pedido cancelado', 'Si tienes dudas, escríbenos.'],
    EXPIRADO: [XCircle, 'text-muted', 'No alcanzamos a recibir el pago', 'La reserva venció y el stock se liberó. Puedes volver a comprar cuando quieras.'],
  }
  const [Icon, color, title, text] = map[order.status] || map.PENDIENTE_PAGO
  return (
    <div className="flex items-start gap-4">
      <Icon size={36} strokeWidth={1.6} className={`flex-none ${color}`} aria-hidden="true" />
      <div>
        <h1 className="display-md">{title}</h1>
        <p className="mt-2 text-muted">{text}</p>
      </div>
    </div>
  )
}

export default function OrderPage() {
  const { orderNumber } = useParams()
  const [params, setParams] = useSearchParams()
  const token = params.get('t')
  // Parámetros de retorno de Mercado Pago: se leen una sola vez y luego se limpian de la URL.
  const [{ paymentId, returnedFromPayment }] = useState(() => {
    const id = params.get('payment_id') || params.get('collection_id')
    return { paymentId: id && id !== 'null' ? id : null, returnedFromPayment: Boolean(id || params.get('status')) }
  })
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)
  const polls = useRef(0)
  const add = useCart((s) => s.add)
  const countdown = useCountdown(order?.status === 'PENDIENTE_PAGO' ? order.expiresAt : null)
  useSeo({ title: `Pedido ${orderNumber}` })

  const load = useCallback(async () => {
    try {
      const data = paymentId && polls.current === 0
        ? await api('/checkout/confirm', { method: 'POST', body: { orderNumber, token, paymentId } })
        : await api(`/orders/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token || '')}`)
      setOrder(data)
      setError(null)
      return data
    } catch (e) {
      setError(e)
      return null
    }
  }, [orderNumber, token, paymentId])

  useEffect(() => {
    let timer
    const tick = async () => {
      const data = await load()
      polls.current += 1
      // Si vuelve de Mercado Pago y el pago aún no se refleja, reintenta unos segundos.
      if (data?.status === 'PENDIENTE_PAGO' && returnedFromPayment && polls.current < 12) timer = setTimeout(tick, 4000)
    }
    tick()
    return () => clearTimeout(timer)
  }, [load, returnedFromPayment])

  useEffect(() => {
    if (order && params.size > 1 && token) setParams(new URLSearchParams({ t: token }), { replace: true })
  }, [order, params, token, setParams])

  async function payAgain() {
    setPaying(true)
    try {
      const { redirectUrl } = await api('/checkout/pay', { method: 'POST', body: { orderNumber, token } })
      window.location.assign(redirectUrl)
    } catch (e) {
      setPaying(false)
      toast(e.message, 'error')
      load()
    }
  }

  function buyAgain() {
    for (const item of order.items) {
      if (item.productId) add({ productId: item.productId, title: item.title, image: null, packUnits: item.packUnits, unitPrice: item.unitPrice, quantity: item.quantity })
    }
  }

  if (!token) {
    return <div className="container-x py-20"><ErrorState title="Link incompleto" message="Abre el link que te enviamos por email o busca tu pedido en Seguimiento." /></div>
  }
  if (error && !order) {
    return <div className="container-x py-20"><ErrorState title="No pudimos abrir este pedido" message={error.message} onRetry={load} /></div>
  }
  if (!order) {
    return <div className="container-x space-y-6 py-14"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-80 w-full rounded-4xl" /></div>
  }

  const wa = whatsappLink(`Hola, tengo una consulta sobre mi pedido ${order.orderNumber}`)
  const rejected = order.status === 'PENDIENTE_PAGO' && ['rejected', 'cancelled'].includes(order.paymentStatus)

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-muted">Pedido</span>
        <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
        <StatusBadge status={order.status} customer />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-4xl border border-sand bg-paper p-6 sm:p-8">
            <Headline order={order} />
            {order.status === 'PENDIENTE_PAGO' && (
              <div className="mt-6 rounded-2xl bg-bone p-5">
                {rejected && <p className="mb-3 text-sm font-medium text-danger">Mercado Pago rechazó el último intento. Puedes probar con otro medio de pago.</p>}
                {returnedFromPayment && !rejected && polls.current < 12 && (
                  <p className="mb-3 flex items-center gap-2 text-sm text-muted"><RefreshCw size={14} className="animate-spin" aria-hidden="true" /> Confirmando tu pago con Mercado Pago…</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm">Reserva válida por <strong className="font-mono tabular">{countdown}</strong></p>
                  <Button onClick={payAgain} loading={paying}><CreditCard size={16} aria-hidden="true" /> Pagar {formatCLP(order.total)}</Button>
                </div>
              </div>
            )}
            {order.status === 'EXPIRADO' && (
              <Button to="/checkout" className="mt-6" onClick={buyAgain}>Volver a comprar lo mismo</Button>
            )}
          </div>

          {!['CANCELADO', 'EXPIRADO'].includes(order.status) && (
            <div className="rounded-4xl border border-sand bg-paper p-6 sm:p-8">
              <h2 className="mb-6 font-display text-xl font-bold">Seguimiento</h2>
              <OrderTimeline order={order} />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast('Link copiado'))}>
              <Copy size={14} aria-hidden="true" /> Copiar link del pedido
            </Button>
            {wa && (
              <Button variant="secondary" size="sm" href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} aria-hidden="true" /> ¿Dudas? WhatsApp
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-4xl border border-sand bg-paper p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">Detalle</h2>
            <ul className="mt-4 divide-y divide-sand">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{i.quantity} × {i.title}<span className="block text-xs text-muted">{packLabelLong(i.packUnits)}</span></span>
                  <span className="tabular">{formatCLP(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <PriceRows subtotal={order.subtotal} discount={order.discount} couponCode={order.couponCode} shipping={order.shippingCost} total={order.total} />
            </div>
          </div>
          <div className="rounded-4xl border border-sand bg-paper p-6 text-sm sm:p-8">
            <h2 className="font-display text-xl font-bold">Despacho</h2>
            <p className="mt-4">{order.customerName}</p>
            <p className="text-muted">{order.shippingAddress}</p>
            <p className="text-muted">{order.shippingCommune}, {order.shippingRegion}</p>
            <p className="mt-3 text-muted">{order.customerEmail} · {order.customerPhone}</p>
            <p className="mt-3 text-muted">Documento: {order.documentType === 'factura' ? 'Factura' : 'Boleta'}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
