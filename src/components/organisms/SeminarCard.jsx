import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowUpRight, Users } from 'lucide-react'
import { SEMINAR_KINDS, formatSeminarDate, seminarTimeLabel, seatsLeft } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { Badge } from '../atoms/Badge'
import { DateBlock, SeatsBar } from '../molecules/SeminarBits'

export function SeminarCard({ seminar, featured = false }) {
  const full = seminar.price !== null && seatsLeft(seminar) === 0
  return (
    <Link
      to={`/capacitaciones/${seminar.slug}`}
      className={`group flex flex-col gap-5 rounded-4xl border p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lift sm:flex-row sm:items-center sm:p-7 ${
        featured ? 'border-transparent bg-ink text-paper' : 'border-sand bg-paper'
      }`}
    >
      <DateBlock date={seminar.date} tone={featured ? 'blush' : 'dark'} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={featured ? 'light' : 'gold'}>{SEMINAR_KINDS[seminar.kind]}</Badge>
          {seminar.isCancelled && <Badge tone="danger">Cancelado</Badge>}
          {full && <Badge tone="danger">Agotado</Badge>}
        </div>
        <h3 className="mt-3 text-xl font-bold sm:text-2xl">{seminar.title}</h3>
        <p className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm ${featured ? 'text-paper/65' : 'text-muted'}`}>
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" />{seminar.city}{seminar.venue ? ` · ${seminar.venue}` : ''}</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden="true" />{formatSeminarDate(seminar.date, { weekday: 'long' })} · {seminarTimeLabel(seminar)}</span>
          {seminar.host && <span className="inline-flex items-center gap-1.5"><Users size={14} aria-hidden="true" />{seminar.host}</span>}
        </p>
        <div className="mt-4 max-w-sm"><SeatsBar seminar={seminar} tone={featured ? 'light' : 'dark'} /></div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <p className="font-display text-2xl font-bold tabular">{seminar.price === null ? <span className="text-base font-medium">Valor por confirmar</span> : formatCLP(seminar.price)}</p>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${featured ? 'bg-gold text-ink' : 'bg-ink text-paper group-hover:bg-navy-700'}`}>
          {seminar.price === null ? 'Pre-inscribirme' : full ? 'Ver detalle' : 'Inscribirme'} <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
