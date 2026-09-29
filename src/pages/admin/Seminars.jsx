import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, CalendarDays, CheckCircle2, AlertTriangle, Link2, Unlink } from 'lucide-react'
import { SEMINAR_KINDS } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Badge } from '../../components/atoms/Badge'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState, EmptyState } from '../../components/molecules/Feedback'
import { DateBlock } from '../../components/molecules/SeminarBits'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

function GoogleCard() {
  const { data: status, loading, reload, mutate } = useAdminData('/admin/google')
  const [params, setParams] = useSearchParams()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const result = params.get('google')
    if (!result) return
    toast(result === 'ok' ? 'Google Calendar conectado' : 'No se pudo conectar con Google', result === 'ok' ? 'success' : 'error')
    setParams({}, { replace: true })
  }, [params, setParams])

  async function connect() {
    setBusy(true)
    try {
      const { url } = await mutate('/admin/google/connect')
      window.location.assign(url)
    } catch (e) {
      toast(e.message, 'error')
      setBusy(false)
    }
  }

  async function disconnect() {
    if (!window.confirm('¿Desconectar Google Calendar? Los eventos ya creados se mantienen en tu calendario.')) return
    await mutate('/admin/google', { method: 'DELETE' }).catch((e) => toast(e.message, 'error'))
    reload()
  }

  if (loading && !status) return <Skeleton className="h-28 rounded-3xl" />
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-blush"><CalendarDays size={22} className="text-gold-deep" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Google Calendar</p>
        {!status?.configured ? (
          <p className="text-sm text-muted">Falta configurar las credenciales de Google (GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET) en Vercel.</p>
        ) : status.connected ? (
          <p className="text-sm text-muted">Conectado{status.email ? ` como ${status.email}` : ''}. Cada capacitación aparece en tu calendario con la lista de inscritos.</p>
        ) : (
          <p className="text-sm text-muted">Conéctalo para ver cada capacitación y sus inscritos (nombre, teléfono y email) en tu calendario.</p>
        )}
      </div>
      {status?.configured && (status.connected ? (
        <Button variant="secondary" size="sm" onClick={disconnect}><Unlink size={14} /> Desconectar</Button>
      ) : (
        <Button size="sm" onClick={connect} loading={busy}><Link2 size={14} /> Conectar Google Calendar</Button>
      ))}
    </Card>
  )
}

export default function Seminars() {
  const { data: seminars, error, loading, reload } = useAdminData('/admin/seminars')
  const today = new Date(Date.now() - 12 * 60 * 60 * 1000)
  const upcoming = seminars?.filter((s) => new Date(s.date) >= today) || []
  const past = seminars?.filter((s) => new Date(s.date) < today).reverse() || []

  const row = (s) => (
    <Link key={s.id} to={`/admin/capacitaciones/${s.id}`} className="block">
      <Card className="flex flex-col gap-4 transition-shadow duration-200 hover:shadow-card sm:flex-row sm:items-center">
        <DateBlock date={s.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-bold">{s.title}</p>
            <Badge tone="gold">{SEMINAR_KINDS[s.kind]}</Badge>
            {!s.isPublished && <Badge tone="warning">Oculta</Badge>}
            {s.isCancelled && <Badge tone="danger">Cancelada</Badge>}
          </div>
          <p className="text-sm text-muted">{s.city}{s.host ? ` · ${s.host}` : ''}{s.scheduleNote ? ` · ${s.scheduleNote}` : ''}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            {s.calendarError ? <><AlertTriangle size={12} className="text-warning" /> Calendario: {s.calendarError}</>
              : s.calendarEventId ? <><CheckCircle2 size={12} className="text-success" /> En Google Calendar</> : null}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center sm:w-80">
          <div><p className="font-display text-2xl font-bold tabular">{s.paid}<span className="text-sm text-muted">/{s.capacity}</span></p><p className="text-2xs text-muted">Inscritos</p></div>
          <div><p className="font-display text-2xl font-bold tabular">{s.preRegistered}</p><p className="text-2xs text-muted">Pre-inscritos</p></div>
          <div><p className="font-display text-lg font-bold tabular">{s.price === null ? '—' : formatCLP(s.revenue)}</p><p className="text-2xs text-muted">{s.price === null ? 'Valor por definir' : 'Recaudado'}</p></div>
        </div>
      </Card>
    </Link>
  )

  return (
    <AdminPage title="Capacitaciones" description="Seminarios, cursos y clases con cupos e inscripción pagada." actions={<Button to="/admin/capacitaciones/nueva"><Plus size={16} /> Nueva capacitación</Button>}>
      <div className="space-y-6">
        <GoogleCard />
        {loading && !seminars ? (
          <Skeleton className="h-64 rounded-3xl" />
        ) : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : seminars.length === 0 ? (
          <Card><EmptyState icon={CalendarDays} title="Aún no hay capacitaciones" action={<Button to="/admin/capacitaciones/nueva">Crear la primera</Button>} /></Card>
        ) : (
          <>
            <div className="space-y-3">{upcoming.map(row)}</div>
            {past.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted hover:text-ink">Anteriores ({past.length})</summary>
                <div className="mt-3 space-y-3 opacity-80">{past.map(row)}</div>
              </details>
            )}
          </>
        )}
      </div>
    </AdminPage>
  )
}
