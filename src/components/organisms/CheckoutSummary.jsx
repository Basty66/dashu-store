import { useState } from 'react'
import { Tag, X, AlertTriangle } from 'lucide-react'
import { formatCLP, packLabelLong } from '@shared/pricing.js'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { PriceRows } from '../molecules/PriceRows'
import { FreeShippingBar } from '../molecules/FreeShippingBar'

function CouponBox({ applied, error, onApply, onRemove, busy }) {
  const [code, setCode] = useState('')
  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
        <span className="flex items-center gap-2"><Tag size={15} aria-hidden="true" /> Cupón <strong>{applied}</strong> aplicado</span>
        <button type="button" onClick={onRemove} className="rounded-md p-1 hover:bg-success/10" aria-label="Quitar cupón"><X size={15} /></button>
      </div>
    )
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (code.trim()) onApply(code.trim().toUpperCase())
      }}
    >
      <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Cupón de descuento" aria-label="Cupón de descuento" className="h-11 uppercase" invalid={Boolean(error)} />
      <Button type="submit" variant="secondary" className="h-11 flex-none" loading={busy} disabled={!code.trim()}>Aplicar</Button>
    </form>
  )
}

export function CheckoutSummary({ items, quote, loading, coupon, onApplyCoupon, onRemoveCoupon }) {
  const lines = quote?.lines || items.map((i) => ({ ...i, lineTotal: i.unitPrice * i.quantity }))
  const subtotal = quote?.subtotal ?? lines.reduce((s, l) => s + l.lineTotal, 0)
  const couponError = coupon && quote?.couponError

  return (
    <aside className="rounded-4xl border border-sand bg-paper p-6 sm:p-8" aria-labelledby="summary-title">
      <h2 id="summary-title" className="font-display text-xl font-bold">Resumen del pedido</h2>
      <ul className="mt-5 divide-y divide-sand">
        {lines.map((l) => (
          <li key={`${l.productId}:${l.packUnits}`} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-navy">
              {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 font-mono text-[10px] text-paper">{l.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{l.title}</p>
              <p className="text-xs text-muted">{packLabelLong(l.packUnits)}</p>
            </div>
            <p className="text-sm font-medium tabular">{formatCLP(l.lineTotal)}</p>
          </li>
        ))}
      </ul>

      {quote?.problems?.length > 0 && (
        <div className="mt-2 space-y-1 rounded-2xl bg-danger/10 p-4 text-sm text-danger" role="alert">
          {quote.problems.map((p, i) => (
            <p key={i} className="flex gap-2"><AlertTriangle size={15} className="mt-0.5 flex-none" aria-hidden="true" />{p.error}</p>
          ))}
          <p className="pt-1 text-xs">Ajusta las cantidades en tu carrito para continuar.</p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <CouponBox applied={!couponError && quote?.coupon ? quote.coupon.code : null} error={couponError} onApply={onApplyCoupon} onRemove={onRemoveCoupon} busy={loading && Boolean(coupon)} />
        {couponError && <p className="text-sm text-danger" role="alert">{couponError}</p>}
      </div>

      <div className={`mt-6 transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
        <PriceRows subtotal={subtotal} discount={quote?.discount || 0} couponCode={quote?.coupon?.code} shipping={quote?.shipping} total={quote?.total ?? subtotal} />
      </div>
      <div className="mt-6">
        <FreeShippingBar subtotal={subtotal - (quote?.discount || 0)} />
      </div>
    </aside>
  )
}
