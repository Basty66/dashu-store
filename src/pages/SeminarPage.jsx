import { Link, useParams } from 'react-router-dom'
import { ChevronRight, MapPin, Clock, Users, CalendarPlus, Ticket } from 'lucide-react'
import { SEMINAR_KINDS, formatSeminarDate, seminarTimeLabel, seatsLeft, googleCalendarLink } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { FOUNDER } from '@shared/store.js'
import { useSeminar } from '../hooks/useSeminars'
import { useSeo } from '../hooks/useSeo'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState } from '../components/molecules/Feedback'
import { DateBlock, SeatsBar } from '../components/molecules/SeminarBits'
import { EnrollForm } from '../components/organisms/EnrollForm'
import { MobileStickyBar } from '../components/organisms/MobileStickyBar'
import { scrollToTarget } from '../lib/smoothScroll'

export default function SeminarPage() {
  const { slug } = useParams()
  const { data: s, error, loading, retry } = useSeminar(slug)
  useSeo({ title: s ? `${s.title} · ${s.city}` : 'Capacitación', description: s?.summary })

  if (loading) return <div className="container-x grid gap-8 py-14 lg:grid-cols-2"><Skeleton className="h-96 rounded-4xl" /><Skeleton className="h-96 rounded-4xl" /></div>
  if (error) {
    return (
      <div className="container-x py-20">
        {error.status === 404 ? (
          <div className="flex flex-col items-center gap-4 text-center"><p className="display-md">No encontramos esta capacitación</p><Button to="/capacitaciones">Ver todas las fechas</Button></div>
        ) : <ErrorState message={error.message} onRetry={retry} />}
      </div>
    )
  }

  const full = s.price !== null && seatsLeft(s) === 0
  const closed = s.isCancelled || full
  const details = [
    [Clock, 'Fecha y horario', <>{formatSeminarDate(s.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br />{seminarTimeLabel(s)}</>],
    [MapPin, 'Lugar', [s.venue, s.address, s.city].filter(Boolean).join(', ') || s.city],
    [Users, 'Imparte', s.host ? `${FOUNDER.name} · ${s.host}` : FOUNDER.name],
    [Ticket, 'Valor', s.price === null ? 'Por confirmar' : formatCLP(s.price)],
  ]

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-1.5 sm:mb-8 text-sm text-muted">
        <Link to="/capacitaciones" className="py-2 hover:text-ink">Capacitaciones</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-ink" aria-current="page">{s.city}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-start gap-5">
            <DateBlock date={s.date} size="lg" />
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="gold">{SEMINAR_KINDS[s.kind]}</Badge>
                {s.scheduleNote && <Badge>{s.scheduleNote}</Badge>}
                {s.isCancelled && <Badge tone="danger">Cancelado</Badge>}
              </div>
              <h1 className="display-lg mt-3">{s.title}</h1>
              <p className="mt-2 text-lg text-muted">{s.city}</p>
            </div>
          </div>

          {s.summary && <p className="mt-8 text-lg leading-relaxed">{s.summary}</p>}
          {s.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/75">{s.description}</p>}

          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            {details.map(([Icon, label, value]) => (
              <div key={label} className="flex gap-4 rounded-3xl border border-sand bg-paper p-5">
                <Icon size={20} className="mt-0.5 flex-none text-gold-deep" aria-hidden="true" />
                <div className="flex flex-col-reverse">
                  <dd className="text-sm">{value}</dd>
                  <dt className="eyebrow mb-1 text-muted">{label}</dt>
                </div>
              </div>
            ))}
          </dl>

          <Button variant="ghost" href={googleCalendarLink(s, window.location.origin)} target="_blank" rel="noopener noreferrer" className="mt-6">
            <CalendarPlus size={16} aria-hidden="true" /> Agregar a mi calendario
          </Button>
        </div>

        <aside className="lg:col-span-5">
          <div id="inscripcion" className="rounded-3xl border border-sand bg-paper p-5 shadow-card sm:rounded-4xl sm:p-8 lg:sticky lg:top-24">
            <p className="eyebrow text-gold-deep">{s.price === null ? 'Pre-inscripción' : 'Inscripción'}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular">{s.price === null ? 'Valor por confirmar' : formatCLP(s.price)}</p>
            <div className="mt-4"><SeatsBar seminar={s} /></div>
            <div className="my-6 h-px bg-sand" />
            {s.isCancelled ? (
              <p className="rounded-2xl bg-danger/10 p-4 text-sm text-danger">Esta capacitación fue cancelada. Revisa las otras fechas disponibles.</p>
            ) : full ? (
              <p className="rounded-2xl bg-warning/10 p-4 text-sm text-warning">Los cupos se agotaron. Escríbenos para quedar en lista de espera.</p>
            ) : (
              <EnrollForm seminar={s} disabled={closed} />
            )}
          </div>
        </aside>
      </div>

      {/* Celular: el formulario está al final; esta barra lleva directo a él. */}
      {!closed && (
        <MobileStickyBar targetId="inscripcion" mode="before">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{s.title} · {s.city}</p>
            <p className="text-xs text-muted tabular">{s.price === null ? 'Pre-inscripción sin costo' : formatCLP(s.price)}</p>
          </div>
          <Button className="flex-none" onClick={() => scrollToTarget(document.getElementById('inscripcion'))}>
            {s.price === null ? 'Pre-inscribirme' : 'Inscribirme'}
          </Button>
        </MobileStickyBar>
      )}
    </div>
  )
}
