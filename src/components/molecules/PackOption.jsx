import { formatCLP, packUnitPrice, packLabel } from '@shared/pricing.js'
import { Badge } from '../atoms/Badge'

// Fila seleccionable de un formato de venta (radio accesible), pensada para comparar precios.
export function PackOption({ pack, savings, selected, highlight, disabled, onSelect }) {
  const compareAt = savings?.amount > 0 ? pack.price + savings.amount : null
  return (
    <label
      className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 transition-all duration-200 ease-out sm:px-5
        ${selected ? 'border-ink shadow-card ring-1 ring-ink' : 'border-sand-300 hover:border-ink/40'}
        ${disabled ? 'pointer-events-none opacity-45' : ''}`}
    >
      <input type="radio" name="pack" className="sr-only" checked={selected} disabled={disabled} onChange={onSelect} />
      <span className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 transition-colors ${selected ? 'border-ink' : 'border-sand-300 group-hover:border-ink/40'}`} aria-hidden="true">
        <span className={`h-2.5 w-2.5 rounded-full bg-ink transition-transform duration-200 ${selected ? 'scale-100' : 'scale-0'}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-bold leading-tight" style={{ fontStretch: '112%' }}>{packLabel(pack.units)}</span>
          {highlight && <Badge tone="goldSolid">Más elegido</Badge>}
        </span>
        <span className="block text-sm text-muted tabular">
          {pack.units === 1 ? 'Precio unitario' : `${pack.units} unidades · ${formatCLP(packUnitPrice(pack))} c/u`}
        </span>
        {disabled && <span className="block text-xs text-danger">Sin stock suficiente</span>}
      </span>
      <span className="flex-none text-right tabular">
        {savings?.percent > 0 && <span className="block text-xs font-medium text-success">Ahorras {savings.percent}%</span>}
        <span className="block font-mono text-[0.95rem] font-medium">{formatCLP(pack.price)}</span>
        {compareAt && <s className="block text-xs text-muted">{formatCLP(compareAt)}</s>}
      </span>
    </label>
  )
}
