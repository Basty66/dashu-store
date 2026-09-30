import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, XCircle, CalendarPlus, CreditCard, MapPin, RefreshCw, MessageCircle } from 'lucide-react'
import { formatSeminarDate, seminarTimeLabel, googleCalendarLink, ENROLLMENT_STATUS } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { api } from '../lib/api'
import { whatsappLink } from '../lib/contact'
import { toast } from '../store/toast'
import { useSeo } from '../hooks/useSeo'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState } from '../components/molecules/Feedback'
import { DateBlock } from '../components/molecules/SeminarBits'
import { ThankYouCard } from '../components/organisms/ThankYouCard'

const heads = {
  PAGADO: [CheckCircle2, 'text-success', (n) => `¡Listo, ${n}! Tu cupo está confirmado`, 'Te enviamos la confirmación por email. Agrega la fecha a tu calendario para no olvidarla.'],
  PREINSCRITO: [CheckCircle2, 'text-success', (n) => `${n}, quedaste pre-inscrito`, 'Te avisaremos apenas se confirme el valor para que asegures tu cupo.'],
  PENDIENTE_PAGO: [Clock, 'text-warning', (n) => `${n}, tu cupo está reservado`, 'Completa el pago en Mercado Pago para confirmarlo.'],
  EXPIRADO: [XCircle, 'text-muted', () => 'No alcanzamos a recibir el pago', 'La reserva venció y el cupo se liberó. Puedes volver a inscribirte si quedan cupos.'],
  CANCELADO: [XCircle, 'text-danger', () => 'Inscripción cancelada', 'Si tienes dudas, escríbenos.'],
}

export default function EnrollmentPage() {
  const { code } = useParams()
  const [params, setParams] = useSearchParams()
  const token = params.get('t')
  const [{ paymentId, returned }] = useState(() => {
    const id = params.get('payment_id') || params.get('collection_id')
    return { paymentId: id && id !== 'null' ? id : null, returned: Boolean(id || params.get('status')) }
  })
  const [e, setE] = useState(null)
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)
  const polls = useRef(0)
  useSeo({ title: `Inscripción ${code}` })

  const load = useCallback(async () => {
    try {
      const data = paymentId && polls.current === 0
        ? await api(`/seminars/inscripcion/${code}/confirm`, { method: 'POST', body: { token, paymentId } })
        : await api(`/seminars/inscripcion/${code}?t=${encodeURIComponent(token || '')}`)
      setE(data)
      setError(null)
      return data
    } catch (err) {
      setError(err)
      return null
    }
  }, [code, token, paymentId])

  useEffect(() => {
    let timer
    const tick = async () => {
      const data = await load()
      polls.current += 1
      if (data?.status === 'PENDIENTE_PAGO' && returned && polls.current < 12) timer = setTimeout(() => void tick(), 4000)
    }
    void tick()
    return () => clearTimeout(timer)
  }, [load, returned])

  useEffect(() => {
    if (e && params.size > 1 && token) setParams(new URLSearchParams({ t: token }), { replace: true })
  }, [e, params, token, setParams])

  async function pay() {
    setPaying(true)
    try {
      const { redirectUrl } = await api(`/seminars/inscripcion/${code}/pay`, { method: 'POST', body: { token } })
      window.location.assign(redirectUrl)
    } catch (err) {
      setPaying(false)
      toast(err.message, 'error')
      void load()
    }
  }

  if (!token) return <div className="container-x py-20"><ErrorState title="Link incompleto" message="Abre el link que te enviamos por email." /></div>
  if (error && !e) return <div className="container-x py-20"><ErrorState title="No pudimos abrir tu inscripción" message={error.message} onRetry={load} /></div>
  if (!e) return <div className="container-x space-y-6 py-14"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-72 rounded-4xl" /></div>

  const s = e.seminar
  const [Icon, color, title, text] = heads[e.status] || heads.PENDIENTE_PAGO
  const first = e.name.split(' ')[0]
  const wa = whatsappLink(`Hola, tengo una consulta sobre mi inscripción ${e.code} (${s.title}, ${s.city})`)

  return (
    <div className="container-x max-w-4xl py-10 lg:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-muted">Inscripción</span>
        <span className="font-mono text-sm font-medium">{e.code}</span>
        <Badge tone={ENROLLMENT_STATUS[e.status]?.tone}>{ENROLLMENT_STATUS[e.status]?.label}</Badge>
      </div>

      {['PAGADO', 'PREINSCRITO'].includes(e.status) && (
        <div className="mb-8">
          <ThankYouCard
            name={first}
            code={e.code}
            label={s.city}
            message={e.status === 'PAGADO' ? 'Gracias por inscribirte,' : 'Gracias por tu interés,'}
            note={e.status === 'PAGADO' ? 'Nos vemos en la capacitación. Agrega la fecha a tu calendario.' : 'Te avisaremos apenas se confirme el valor.'}
          />
        </div>
      )}

      <div className="rounded-4xl border border-sand bg-paper p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Icon size={36} strokeWidth={1.6} className={`flex-none ${color}`} aria-hidden="true" />
          <div>
            <h1 className="display-md">{title(first)}</h1>
            <p className="mt-2 text-muted">{text}</p>
          </div>
        </div>
        {e.status === 'PENDIENTE_PAGO' && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-bone p-5">
            <p className="flex items-center gap-2 text-sm">
              {returned && polls.current < 12 && <RefreshCw size={14} className="animate-spin" aria-hidden="true" />}
              {e.paymentStatus === 'rejected' ? <span className="text-danger">El pago fue rechazado. Intenta con otro medio.</span> : 'Esperando la confirmación del pago…'}
            </p>
            <Button onClick={pay} loading={paying}><CreditCard size={16} aria-hidden="true" /> Pagar {formatCLP(e.amount)}</Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 rounded-4xl bg-ink p-6 text-paper sm:flex-row sm:items-center sm:p-8">
        <DateBlock date={s.date} tone="blush" size="lg" />
        <div className="flex-1">
          <p className="eyebrow text-gold">{s.city}</p>
          <p className="mt-1 font-display text-2xl font-bold">{s.title}</p>
          <p className="mt-2 text-sm text-paper/70">{formatSeminarDate(s.date, { weekday: 'long', day: 'numeric', month: 'long' })} · {seminarTimeLabel(s)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-paper/70"><MapPin size={14} aria-hidden="true" />{[s.venue, s.address, s.city].filter(Boolean).join(', ')}</p>
        </div>
        {['PAGADO', 'PREINSCRITO'].includes(e.status) && (
          <Button variant="gold" href={googleCalendarLink(s, window.location.origin)} target="_blank" rel="noopener noreferrer">
            <CalendarPlus size={16} aria-hidden="true" /> Agregar a Google Calendar
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" to={`/capacitaciones/${s.slug}`}>Ver la capacitación</Button>
        {wa && <Button variant="secondary" size="sm" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} aria-hidden="true" /> ¿Dudas? WhatsApp</Button>}
        {e.status === 'EXPIRADO' && <Button size="sm" to={`/capacitaciones/${s.slug}`}>Inscribirme de nuevo</Button>}
      </div>
      <p className="mt-6 text-xs text-muted">Guarda este link: es tu comprobante de inscripción. <Link to="/capacitaciones" className="underline">Ver otras fechas</Link></p>
    </div>
  )
}
