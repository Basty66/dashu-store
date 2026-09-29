import { Truck } from 'lucide-react'
import { FREE_SHIPPING_FROM } from '@shared/shipping.js'
import { formatCLP } from '@shared/pricing.js'

export function FreeShippingBar({ subtotal }) {
  if (FREE_SHIPPING_FROM === null) return null
  const missing = Math.max(0, FREE_SHIPPING_FROM - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)
  return (
    <div className="rounded-2xl bg-bone p-4">
      <p className="flex items-center gap-2 text-sm">
        <Truck size={16} className={missing === 0 ? 'text-success' : 'text-gold-deep'} aria-hidden="true" />
        {missing === 0 ? (
          <span className="font-medium text-success">¡Tu pedido tiene envío gratis!</span>
        ) : (
          <span>
            Te faltan <strong className="tabular">{formatCLP(missing)}</strong> para el <strong>envío gratis</strong>
          </span>
        )}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso hacia envío gratis">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-deep transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
