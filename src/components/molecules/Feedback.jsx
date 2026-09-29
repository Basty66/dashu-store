import { AlertTriangle, RotateCcw } from 'lucide-react'
import { ORDER_STATUS } from '@shared/orderStatus.js'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'

export function ErrorState({ title = 'No pudimos cargar esta sección', message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-3xl border border-sand bg-paper p-10 text-center ${className}`} role="alert">
      <AlertTriangle className="text-warning" size={28} aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw size={14} /> Reintentar
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ink/5">
          <Icon size={22} className="text-muted" aria-hidden="true" />
        </span>
      )}
      <p className="font-medium">{title}</p>
      {message && <p className="max-w-xs text-sm text-muted">{message}</p>}
      {action}
    </div>
  )
}

const statusTone = { amber: 'warning', green: 'success', blue: 'info', red: 'danger', neutral: 'neutral' }

export function StatusBadge({ status, customer = false }) {
  const meta = ORDER_STATUS[status]
  if (!meta) return <Badge>{status}</Badge>
  return <Badge tone={statusTone[meta.tone]}>{customer ? meta.customer : meta.label}</Badge>
}
