import { Input } from '../atoms/Input'

// Campo de monto en pesos: muestra "$" adelante y entrega un número ('' si está vacío).
export function MoneyInput({ value, onChange, step = 500, className = '', ...props }) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted">$</span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className={`pl-8 font-mono tabular ${className}`}
        {...props}
      />
    </div>
  )
}
