import { useState } from 'react'
import { Store, MessageCircle, Mail, Trash2 } from 'lucide-react'
import { LEAD_STATUS } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { useDistributor } from '../../store/storeConfig'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { Select, Textarea } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState, EmptyState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const waNumber = (phone) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 9 ? `56${d}` : d
}

function Lead({ lead, mutate, onChange }) {
  const distributor = useDistributor()
  const [notes, setNotes] = useState(lead.notes || '')
  const units = lead.boxes * distributor.unitsPerBox
  const wa = `https://wa.me/${waNumber(lead.phone)}?text=${encodeURIComponent(
    `Hola ${lead.name.split(' ')[0]}, gracias por postular como distribuidor DASHU. Para ser distribuidor el pedido mínimo es de ${distributor.minBoxes} embalajes de ${distributor.unitsPerBox} cremas por ${formatCLP(distributor.minTotal)} (${formatCLP(distributor.unitCost)} c/u). ¿Coordinamos tu pedido?`,
  )}`

  const patch = (body, msg) => mutate(`/admin/distributors/${lead.id}`, { method: 'PATCH', body }).then(() => { if (msg) toast(msg); onChange() }).catch((e) => toast(e.message, 'error'))

  return (
    <Card className={lead.status === 'NUEVO' ? 'border-gold/60 bg-white' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-bold">{lead.business}</p>
            <Badge tone={LEAD_STATUS[lead.status].tone}>{LEAD_STATUS[lead.status].label}</Badge>
          </div>
          <p className="text-sm">{lead.name} · {lead.city}, {lead.region}{lead.rut ? ` · RUT ${lead.rut}` : ''}</p>
          <p className="text-sm text-muted">{lead.phone} · {lead.email}</p>
          <p className="mt-2 text-sm">
            Quiere <strong>{lead.boxes} embalajes</strong> ({units} cremas · {formatCLP(units * distributor.unitCost)})
            {lead.boxes < distributor.minBoxes && <span className="ml-2 text-warning">bajo el mínimo</span>}
          </p>
          {lead.message && <p className="mt-2 whitespace-pre-line rounded-xl bg-bone p-3 text-sm">“{lead.message}”</p>}
          <p className="mt-2 text-xs text-muted">{new Date(lead.createdAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</Button>
          <Button size="sm" variant="secondary" href={`mailto:${lead.email}?subject=${encodeURIComponent('Distribuidor DASHU')}`}><Mail size={14} /> Email</Button>
          <Select value={lead.status} onChange={(e) => patch({ status: e.target.value }, 'Estado actualizado')} className="h-9 w-40 text-sm" aria-label="Estado">
            {Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <button type="button" className="rounded-full p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Eliminar postulación"
            onClick={() => window.confirm('¿Eliminar esta postulación?') && mutate(`/admin/distributors/${lead.id}`, { method: 'DELETE' }).then(onChange)}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas" rows={1} className="min-h-[44px]" aria-label="Notas internas" />
        <Button size="sm" variant="secondary" className="h-11" disabled={notes === (lead.notes || '')} onClick={() => patch({ notes }, 'Notas guardadas')}>Guardar</Button>
      </div>
    </Card>
  )
}

export default function Distributors() {
  const distributor = useDistributor()
  const { data, error, loading, reload, mutate } = useAdminData('/admin/distributors')
  const [filter, setFilter] = useState('all')
  const list = (data || []).filter((l) => filter === 'all' || l.status === filter)
  return (
    <AdminPage title="Distribuidores" description={`Postulaciones al programa (mínimo ${distributor.minBoxes} embalajes · ${formatCLP(distributor.minTotal)}).`}>
      <div className="mb-5 flex flex-wrap gap-1">
        {['all', ...Object.keys(LEAD_STATUS)].map((k) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-4 py-2 text-sm transition-colors ${filter === k ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'}`}>
            {k === 'all' ? 'Todas' : LEAD_STATUS[k].label}{data ? ` (${k === 'all' ? data.length : data.filter((l) => l.status === k).length})` : ''}
          </button>
        ))}
      </div>
      {loading && !data ? <Skeleton className="h-48 rounded-3xl" /> : error ? <ErrorState message={error.message} onRetry={reload} /> : list.length === 0 ? (
        <Card><EmptyState icon={Store} title="No hay postulaciones en esta vista" /></Card>
      ) : (
        <div className="space-y-3">{list.map((l) => <Lead key={l.id} lead={l} mutate={mutate} onChange={reload} />)}</div>
      )}
    </AdminPage>
  )
}
