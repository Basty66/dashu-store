import { ShieldCheck, Truck, Receipt, PackageCheck } from 'lucide-react'

const items = [
  { icon: Truck, title: 'Envío a todo Chile', text: 'Despacho por courier con seguimiento' },
  { icon: ShieldCheck, title: 'Pago protegido', text: 'Con Mercado Pago: crédito o débito' },
  { icon: Receipt, title: 'Boleta o factura', text: 'Ideal para barberías y reventa' },
  { icon: PackageCheck, title: 'Seguimiento', text: 'Te avisamos en cada etapa' },
]

export function TrustBadges({ tone = 'dark', compact = false, stacked = false, className = '' }) {
  const title = tone === 'dark' ? 'text-ink' : 'text-paper'
  const text = tone === 'dark' ? 'text-muted' : 'text-paper/60'
  const list = compact || stacked ? items.slice(0, 3) : items
  const cols = stacked ? 'grid-cols-1' : compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
  return (
    <ul className={`grid gap-4 ${cols} ${className}`}>
      {list.map(({ icon: Icon, title: t, text: d }) => (
        <li key={t} className="flex items-start gap-3">
          <Icon size={20} strokeWidth={1.6} className="mt-0.5 flex-none text-gold" aria-hidden="true" />
          <span>
            <span className={`block text-sm font-medium ${title}`}>{t}</span>
            <span className={`block text-xs ${text}`}>{d}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
