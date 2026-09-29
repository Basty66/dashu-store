import { Check, Truck, ExternalLink, Copy } from 'lucide-react'
import { ORDER_FLOW, customerStatusLabel } from '@shared/orderStatus.js'
import { toast } from '../../store/toast'
import { Button } from '../atoms/Button'

const fmt = (date) =>
  new Date(date).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Línea de tiempo del pedido: "Recibimos tu pedido" → "Pago confirmado" → ... → "Entregado".
export function OrderTimeline({ order }) {
  const current = ORDER_FLOW.indexOf(order.status)
  const eventFor = (status) => [...order.events].reverse().find((e) => e.status === status)

  return (
    <ol className="relative space-y-0">
      {ORDER_FLOW.map((status, i) => {
        const done = current >= i
        const active = current === i
        const event = eventFor(status)
        return (
          <li key={status} className="relative flex gap-5 pb-8 last:pb-0">
            {i < ORDER_FLOW.length - 1 && (
              <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${current > i ? 'bg-ink' : 'bg-sand'}`} />
            )}
            <span
              className={`relative z-10 grid h-8 w-8 flex-none place-items-center rounded-full border-2 transition-colors ${
                done ? 'border-ink bg-ink text-paper' : 'border-sand bg-paper text-muted'
              } ${active ? 'ring-4 ring-gold/30' : ''}`}
            >
              {done ? <Check size={15} strokeWidth={3} /> : <span className="font-mono text-xs">{i + 1}</span>}
            </span>
            <div className="min-w-0 pt-1">
              <p className={`font-medium ${done ? 'text-ink' : 'text-muted'}`}>
                {status === 'ENVIADO' && order.courierName ? `En camino con ${order.courierName}` : customerStatusLabel(status)}
              </p>
              {event && <p className="mt-0.5 text-xs text-muted">{fmt(event.createdAt)}</p>}
              {event?.note && done && <p className="mt-1.5 text-sm text-muted">{event.note}</p>}
              {status === 'ENVIADO' && done && (order.trackingNumber || order.trackingUrl) && <TrackingCard order={order} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function TrackingCard({ order }) {
  return (
    <div className="mt-4 rounded-2xl border border-sand bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Truck size={16} className="text-gold-deep" aria-hidden="true" /> {order.courierName}
      </p>
      {order.trackingNumber && (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-muted">N° de seguimiento:</span>
          <span className="font-mono">{order.trackingNumber}</span>
          <button
            type="button"
            className="rounded-md p-1 text-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Copiar número de seguimiento"
            onClick={() => navigator.clipboard?.writeText(order.trackingNumber).then(() => toast('Número copiado'))}
          >
            <Copy size={14} />
          </button>
        </p>
      )}
      {order.trackingUrl && (
        <Button href={order.trackingUrl} target="_blank" rel="noopener noreferrer" size="sm" className="mt-3">
          Seguir en {order.courierName} <ExternalLink size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
