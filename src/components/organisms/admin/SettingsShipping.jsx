import { useId, useState } from 'react'
import { Truck } from 'lucide-react'
import { REGION_NAMES } from '@shared/chile.js'
import { Button } from '../../atoms/Button'
import { Field } from '../../molecules/Field'
import { MoneyInput } from '../../molecules/MoneyInput'
import { Card } from '../../templates/AdminLayout'

// Tarifas de despacho por región y monto para envío gratis.
export function SettingsShipping({ value, onChange, errors }) {
  const id = useId()
  const [bulk, setBulk] = useState('')
  const freeOn = value.freeFrom !== null
  const setRate = (region, amount) => onChange({ ...value, rates: { ...value.rates, [region]: amount } })
  const applyAll = () => bulk !== '' && onChange({ ...value, rates: Object.fromEntries(REGION_NAMES.map((r) => [r, bulk])) })

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Truck size={18} aria-hidden="true" /> Envíos</h2>
        <p className="mt-1 text-sm text-muted">El cliente ve el costo al elegir su región en el checkout.</p>
      </div>

      <div className="rounded-2xl border border-sand bg-white p-4">
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          Envío gratis sobre un monto
          <input type="checkbox" checked={freeOn} onChange={(e) => onChange({ ...value, freeFrom: e.target.checked ? 150000 : null })} className="h-5 w-5 accent-[#171210]" />
        </label>
        {freeOn && (
          <Field label="Envío gratis desde" error={errors.freeFrom} hint="Se compara con el subtotal después de descuentos." className="mt-4">
            <MoneyInput value={value.freeFrom} onChange={(v) => onChange({ ...value, freeFrom: v })} step={5000} />
          </Field>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Mismo valor para todas" optional className="min-w-0 flex-1">
          <MoneyInput value={bulk} onChange={setBulk} placeholder="Ej: 4000" />
        </Field>
        <Button variant="secondary" onClick={applyAll} disabled={bulk === ''}>Aplicar</Button>
      </div>

      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {REGION_NAMES.map((region, i) => (
          <li key={region} className="grid grid-cols-[1fr_8.5rem] items-center gap-3">
            <span className="text-sm leading-tight" id={`${id}-${i}`}>{region}</span>
            <div>
              <MoneyInput value={value.rates[region]} onChange={(v) => setRate(region, v)} aria-labelledby={`${id}-${i}`} invalid={Boolean(errors[`rates.${region}`])} className="h-11" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
