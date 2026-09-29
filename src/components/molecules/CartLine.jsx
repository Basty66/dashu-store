import { Trash2 } from 'lucide-react'
import { formatCLP, packLabelLong, packUnitPrice } from '@shared/pricing.js'
import { QuantityStepper } from './QuantityStepper'

export function CartLine({ line, maxQuantity = 99, onQuantity, onRemove, compact = false }) {
  return (
    <li className="flex gap-4 py-4">
      <div className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-navy">
        {line.image && <img src={line.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{line.title}</p>
            <p className="text-sm text-muted">
              {packLabelLong(line.packUnits)}
              {line.packUnits > 1 && <span className="tabular"> · {formatCLP(packUnitPrice({ price: line.unitPrice, units: line.packUnits }))} c/u</span>}
            </p>
          </div>
          <p className="font-medium tabular">{formatCLP(line.unitPrice * line.quantity)}</p>
        </div>
        {!compact && (
          <div className="mt-auto flex items-center justify-between pt-3">
            <QuantityStepper size="sm" value={line.quantity} max={maxQuantity} onChange={onQuantity} label={`Cantidad de ${packLabelLong(line.packUnits)}`} />
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted transition-colors hover:text-danger" aria-label={`Quitar ${line.title}`}>
              <Trash2 size={14} /> Quitar
            </button>
          </div>
        )}
        {compact && <p className="mt-1 text-xs text-muted">Cantidad: {line.quantity}</p>}
      </div>
    </li>
  )
}
