import { CalendarX, MessageCircle } from 'lucide-react'
import { FOUNDER } from '@shared/store.js'
import { useSeminars } from '../hooks/useSeminars'
import { useSeo } from '../hooks/useSeo'
import { whatsappLink } from '../lib/contact'
import { Button } from '../components/atoms/Button'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState, EmptyState } from '../components/molecules/Feedback'
import { SeminarCard } from '../components/organisms/SeminarCard'

export default function Seminars() {
  useSeo({ title: 'Capacitaciones', description: `Seminarios y clases prácticas de alisado con ${FOUNDER.name}. Revisa fechas, cupos e inscríbete.` })
  const { data, error, loading, retry } = useSeminars()
  const wa = whatsappLink('Hola, quiero llevar una capacitación de DASHU a mi barbería')
  const cities = [...new Set((data || []).map((s) => s.city))]

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy py-16 text-paper lg:py-24">
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="container-x relative">
          <p className="eyebrow text-gold">Capacitaciones {new Date().getFullYear()}</p>
          <h1 className="display-xl mt-4 max-w-4xl text-balance">
            Aprende a dominar el alisado{' '}
            <span className="font-serif font-normal italic text-blush" style={{ fontStretch: '100%' }}>con quien lo trajo a Chile.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/70">
            Seminarios y clases prácticas con {FOUNDER.name}, barbero educador y fundador de Imperio Barber. Cupos limitados en cada ciudad.
          </p>
          {cities.length > 0 && (
            <p className="mt-8 flex flex-wrap gap-2">
              {cities.map((c) => <span key={c} className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-paper/80">{c}</span>)}
            </p>
          )}
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-x space-y-4">
          {loading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-4xl" />)
          ) : error ? (
            <ErrorState message={error.message} onRetry={retry} />
          ) : data.length === 0 ? (
            <EmptyState icon={CalendarX} title="No hay fechas publicadas por ahora" message="Síguenos o escríbenos para enterarte de las próximas capacitaciones." />
          ) : (
            data.map((s, i) => <SeminarCard key={s.id} seminar={s} featured={i === 0} />)
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 rounded-4xl bg-blush p-8 sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="display-md">¿Quieres una capacitación en tu barbería?</h2>
              <p className="mt-2 max-w-lg text-ink/70">Organizamos seminarios y clases privadas para equipos. Cuéntanos tu ciudad y cuántas personas serían.</p>
            </div>
            <Button href={wa || '/contacto'} {...(wa ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <MessageCircle size={16} aria-hidden="true" /> Escríbenos
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
