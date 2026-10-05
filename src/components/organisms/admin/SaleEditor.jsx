import { useId } from 'react'
import { Tag, X } from 'lucide-react'
import { discountPercent, isSaleActive, formatCLP } from '@shared/pricing.js'
import { Input } from '../../atoms/Input'
import { Badge } from '../../atoms/Badge'
import { MoneyInput } from '../../molecules/MoneyInput'

// <input type="datetime-local"> trabaja en hora local "AAAA-MM-DDTHH:mm".
const toLocal = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
const fromLocal = (value) => (value ? new Date(value).toISOString() : null)
const shortDate = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function saleStatus(pack) {
  if (!pack.salePrice || pack.salePrice >= pack.price) return null
  if (isSaleActive(pack)) return { tone: 'sale', text: `Activa · −${discountPercent(pack.price, pack.salePrice)}%` }
  if (pack.saleStartsAt && new Date(pack.saleStartsAt) > new Date()) return { tone: 'info', text: `Parte el ${shortDate.format(new Date(pack.saleStartsAt))}` }
  return { tone: 'neutral', text: 'Terminada' }
}

// Oferta de un formato: precio rebajado con inicio y término opcionales. Se activa y apaga sola.
export function SaleEditor({ pack, onChange, errors = {} }) {
  const id = useId()
  if (pack.salePrice === null || pack.salePrice === undefined) {
    return (
      <button type="button" onClick={() => onChange({ salePrice: '' })} className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-gold-deep underline-offset-4 hover:underline">
        <Tag size={14} aria-hidden="true" /> Agregar oferta
      </button>
    )
  }
  const status = saleStatus(pack)
  return (
    <div className="space-y-3 rounded-2xl bg-bone p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium"><Tag size={14} aria-hidden="true" /> Oferta {status && <Badge tone={status.tone}>{status.text}</Badge>}</p>
        <button type="button" onClick={() => onChange({ salePrice: null, saleStartsAt: null, saleEndsAt: null })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger">
          <X size={13} aria-hidden="true" /> Quitar oferta
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-p`} className="mb-1 block text-xs font-medium">Precio oferta</label>
          <MoneyInput id={`${id}-p`} value={pack.salePrice} onChange={(v) => onChange({ salePrice: v })} invalid={Boolean(errors.salePrice)} className="h-11" />
          {pack.price > 0 && pack.salePrice > 0 && pack.salePrice < pack.price && <p className="mt-1 text-xs text-muted">Antes {formatCLP(pack.price)}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-s`} className="mb-1 block text-xs font-medium">Desde <span className="font-normal text-muted">(opcional)</span></label>
          <Input id={`${id}-s`} type="datetime-local" value={toLocal(pack.saleStartsAt)} onChange={(e) => onChange({ saleStartsAt: fromLocal(e.target.value) })} className="h-11" />
        </div>
        <div>
          <label htmlFor={`${id}-e`} className="mb-1 block text-xs font-medium">Hasta <span className="font-normal text-muted">(opcional)</span></label>
          <Input id={`${id}-e`} type="datetime-local" value={toLocal(pack.saleEndsAt)} onChange={(e) => onChange({ saleEndsAt: fromLocal(e.target.value) })} invalid={Boolean(errors.saleEndsAt)} className="h-11" />
        </div>
      </div>
      {(errors.salePrice || errors.saleEndsAt) && <p className="text-sm text-danger" role="alert">{errors.salePrice || errors.saleEndsAt}</p>}
    </div>
  )
}
