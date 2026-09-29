import { Star, Mail, Trash2, Check, EyeOff, Reply } from 'lucide-react'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Badge } from '../../components/atoms/Badge'
import { Stars, Skeleton } from '../../components/atoms/Misc'
import { ErrorState, EmptyState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const date = (d) => new Date(d).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function List({ path, empty, render }) {
  const { data, error, loading, reload, mutate } = useAdminData(path)
  const act = (url, options, msg) =>
    mutate(url, options)
      .then(() => {
        if (msg) toast(msg)
        reload()
      })
      .catch((e) => toast(e.message, 'error'))
  if (loading && !data) return <Skeleton className="h-64 rounded-3xl" />
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  if (!data.length) return <Card><EmptyState icon={empty.icon} title={empty.title} /></Card>
  return <div className="space-y-3">{data.map((item) => render(item, act))}</div>
}

export function Reviews() {
  return (
    <AdminPage title="Reseñas" description="Las reseñas nuevas quedan ocultas hasta que las apruebes.">
      <List
        path="/admin/reviews"
        empty={{ icon: Star, title: 'Aún no hay reseñas' }}
        render={(r, act) => (
          <Card key={r.id} className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.customerName}</p>
                <Stars value={r.rating} />
                {r.isApproved ? <Badge tone="success">Publicada</Badge> : <Badge tone="warning">Pendiente</Badge>}
              </div>
              <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>
              <p className="mt-2 text-xs text-muted">{date(r.createdAt)}{r.customerEmail ? ` · ${r.customerEmail}` : ''}</p>
            </div>
            <div className="flex gap-2">
              {r.isApproved ? (
                <Button size="sm" variant="secondary" onClick={() => act(`/admin/reviews/${r.id}`, { method: 'PATCH', body: { isApproved: false } }, 'Reseña oculta')}><EyeOff size={14} /> Ocultar</Button>
              ) : (
                <Button size="sm" onClick={() => act(`/admin/reviews/${r.id}`, { method: 'PATCH', body: { isApproved: true } }, 'Reseña publicada')}><Check size={14} /> Publicar</Button>
              )}
              <button type="button" className="rounded-full p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Eliminar reseña"
                onClick={() => window.confirm('¿Eliminar esta reseña?') && act(`/admin/reviews/${r.id}`, { method: 'DELETE' }, 'Reseña eliminada')}>
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        )}
      />
    </AdminPage>
  )
}

export function Messages() {
  return (
    <AdminPage title="Mensajes" description="Consultas del formulario de contacto.">
      <List
        path="/admin/messages"
        empty={{ icon: Mail, title: 'No hay mensajes' }}
        render={(m, act) => (
          <Card key={m.id} className={m.read ? '' : 'border-gold/50 bg-white'}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-medium">{m.name} {!m.read && <Badge tone="gold">Nuevo</Badge>}</p>
                <p className="text-sm text-muted">{m.email}{m.phone ? ` · ${m.phone}` : ''} · {date(m.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Tu consulta en DASHU STORE'}`)}`}><Reply size={14} /> Responder</Button>
                {!m.read && <Button size="sm" variant="secondary" onClick={() => act(`/admin/messages/${m.id}`, { method: 'PATCH', body: { read: true } })}><Check size={14} /> Leído</Button>}
                <button type="button" className="rounded-full p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Eliminar mensaje"
                  onClick={() => window.confirm('¿Eliminar este mensaje?') && act(`/admin/messages/${m.id}`, { method: 'DELETE' }, 'Mensaje eliminado')}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {m.subject && <p className="mt-3 text-sm font-medium">{m.subject}</p>}
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
          </Card>
        )}
      />
    </AdminPage>
  )
}
