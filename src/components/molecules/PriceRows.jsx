import { formatCLP } from '@shared/pricing.js'

// Resumen de totales (carrito, checkout, pedido).
export function PriceRows({ subtotal, discount = 0, couponCode, shipping, total, shippingPending = false }) {
  return (
    <dl className="space-y-2.5 text-sm tabular">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd>{formatCLP(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-success">
          <dt>Descuento{couponCode ? ` · ${couponCode}` : ''}</dt>
          <dd>−{formatCLP(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted">Envío</dt>
        <dd>{shippingPending || shipping === null || shipping === undefined ? <span className="text-muted">Según región</span> : shipping === 0 ? <span className="font-medium text-success">Gratis</span> : formatCLP(shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-sand pt-3">
        <dt className="font-medium">Total</dt>
        <dd className="font-display text-2xl font-bold">{formatCLP(total)}</dd>
      </div>
    </dl>
  )
}
