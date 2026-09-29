import { Minus, Plus } from 'lucide-react'

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label = 'Cantidad' }) {
  const h = size === 'sm' ? 'h-9' : 'h-12'
  const w = size === 'sm' ? 'w-9' : 'w-11'
  const btn = `grid ${h} ${w} place-items-center text-ink transition-colors duration-200 hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-transparent`
  return (
    <div className={`inline-flex items-center overflow-hidden rounded-full border border-sand-300 bg-white`} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Restar uno">
        <Minus size={15} />
      </button>
      <output className={`min-w-[2.25rem] text-center font-mono text-sm tabular`} aria-live="polite">{value}</output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Sumar uno">
        <Plus size={15} />
      </button>
    </div>
  )
}
