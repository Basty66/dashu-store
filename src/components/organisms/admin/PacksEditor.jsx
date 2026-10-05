import { Trash2, Plus } from 'lucide-react'
import { PACK_SIZES } from '@shared/store.js'
import { formatCLP } from '@shared/pricing.js'
import { errorsFor } from '../../../lib/formErrors'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { SaleEditor } from './SaleEditor'

// Formatos de venta (unidades y precio) con su oferta opcional.
export function PacksEditor({ packs, onChange, error, rowErrors = {} }) {
  const update = (i, patch) => onChange(packs.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const missing = PACK_SIZES.filter((u) => !packs.some((p) => p.units === u))
  const unitRef = packs.find((p) => p.units === 1)?.price || 0
  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-12 gap-3 px-1 font-mono text-2xs uppercase tracking-[0.12em] text-muted sm:grid">
        <span className="col-span-2">Unidades</span><span className="col-span-4">Precio del pack (CLP)</span><span className="col-span-3">Por unidad</span><span className="col-span-3 text-right">Visible</span>
      </div>
      {packs.map((p, i) => {
        const per = p.units > 0 && p.price > 0 ? Math.round(p.price / p.units) : 0
        const saving = unitRef && per && p.units > 1 ? Math.round((1 - per / unitRef) * 100) : 0
        return (
          <div key={i} className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-sand bg-white p-3">
            <Input type="number" min={1} value={p.units} onChange={(e) => update(i, { units: Number(e.target.value) })} className="col-span-3 h-11 font-mono sm:col-span-2" aria-label="Unidades del pack" />
            <Input type="number" min={0} step={500} value={p.price || ''} onChange={(e) => update(i, { price: Number(e.target.value) })} className="col-span-9 h-11 font-mono sm:col-span-4" aria-label={`Precio del pack de ${p.units}`} placeholder="Ej: 115000" />
            <p className="col-span-7 text-sm tabular sm:col-span-3">{per ? formatCLP(per) : '—'}{saving > 0 && <span className="ml-2 text-xs text-success">−{saving}%</span>}</p>
            <div className="col-span-5 flex items-center justify-end gap-2 sm:col-span-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} className="h-4 w-4 accent-[#171210]" /> Sí</label>
              <button type="button" onClick={() => onChange(packs.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Quitar pack de ${p.units}`}><Trash2 size={15} /></button>
            </div>
            <div className="col-span-12">
              <SaleEditor pack={p} onChange={(patch) => update(i, patch)} errors={errorsFor(rowErrors, String(i))} />
            </div>
          </div>
        )
      })}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {missing.map((u) => (
          <Button key={u} size="sm" variant="secondary" onClick={() => onChange([...packs, { units: u, price: 0, isActive: true, salePrice: null, saleStartsAt: null, saleEndsAt: null }].sort((a, b) => a.units - b.units))}><Plus size={14} /> {u === 1 ? 'Unidad' : `Pack ${u}`}</Button>
        ))}
      </div>
    </div>
  )
}
