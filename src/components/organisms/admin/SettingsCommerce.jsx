import { Store, Sparkles } from 'lucide-react'
import { PACK_SIZES } from '@shared/store.js'
import { distributorMinimum } from '@shared/storeConfig.js'
import { formatCLP, packLabel } from '@shared/pricing.js'
import { Input, Select } from '../../atoms/Input'
import { Field } from '../../molecules/Field'
import { MoneyInput } from '../../molecules/MoneyInput'
import { Card } from '../../templates/AdminLayout'

// Programa de distribuidores: se usa en la tienda, la calculadora, las preguntas y el email automático.
export function SettingsDistributor({ value, onChange, errors }) {
  const set = (key) => (v) => onChange({ ...value, [key]: v })
  const valid = [value.unitCost, value.unitsPerBox, value.minBoxes].every((n) => Number(n) > 0)
  const min = valid ? distributorMinimum(value) : null
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Store size={18} aria-hidden="true" /> Programa de distribuidores</h2>
        <p className="mt-1 text-sm text-muted">Se actualiza en la tienda, la calculadora, las preguntas frecuentes y el correo automático.</p>
      </div>
      <Field label="Precio por crema" error={errors.unitCost}>
        <MoneyInput value={value.unitCost} onChange={set('unitCost')} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cremas por embalaje" error={errors.unitsPerBox}>
          <Input type="number" inputMode="numeric" min={1} value={value.unitsPerBox} onChange={(e) => set('unitsPerBox')(e.target.value === '' ? '' : Number(e.target.value))} className="font-mono" />
        </Field>
        <Field label="Embalajes mínimos" error={errors.minBoxes}>
          <Input type="number" inputMode="numeric" min={1} value={value.minBoxes} onChange={(e) => set('minBoxes')(e.target.value === '' ? '' : Number(e.target.value))} className="font-mono" />
        </Field>
      </div>
      <p className="rounded-2xl bg-bone px-4 py-3 text-sm" aria-live="polite">
        {min ? <>Pedido mínimo: <strong className="tabular">{min.units} cremas · {formatCLP(min.total)}</strong></> : 'Completa los tres valores para ver el pedido mínimo.'}
      </p>
    </Card>
  )
}

// Formato destacado con la etiqueta "Más elegido".
export function SettingsHighlight({ value, onChange }) {
  const options = [...new Set([...PACK_SIZES, value].filter((n) => n > 0))].sort((a, b) => a - b)
  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Sparkles size={18} aria-hidden="true" /> Formato destacado</h2>
      <Field label="Etiqueta “Más elegido”" hint="Ese formato aparece marcado y preseleccionado en la caja de compra.">
        <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
          <option value={0}>Ninguno</option>
          {options.map((units) => <option key={units} value={units}>{packLabel(units)}</option>)}
        </Select>
      </Field>
    </Card>
  )
}
