import { ArrowRight, Store, Package } from 'lucide-react'
import { formatCLP } from '@shared/pricing.js'
import { useSeminars } from '../../hooks/useSeminars'
import { useDistributor } from '../../store/storeConfig'
import { Button } from '../atoms/Button'
import { Skeleton } from '../atoms/Misc'
import { SectionHeading } from '../molecules/SectionHeading'
import { SeminarCard } from './SeminarCard'

// Próximas capacitaciones en el inicio.
export function UpcomingSeminars({ limit = 3 }) {
  const { data, loading } = useSeminars()
  if (!loading && !data?.length) return null
  return (
    <section id="capacitaciones" className="py-14 sm:py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="Capacitaciones" title="Aprende la técnica en vivo" description="Seminarios y clases prácticas de alisado con Tomás Morales en distintas ciudades de Chile." />
          <Button variant="secondary" to="/capacitaciones" className="hidden sm:inline-flex">Ver todas las fechas <ArrowRight size={16} aria-hidden="true" /></Button>
        </div>
        {/* En celular: carrusel deslizable (se asoma la siguiente tarjeta). En escritorio: lista. */}
        <div className="scrollbar-none -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:block sm:space-y-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {loading
            ? [0, 1].map((i) => <Skeleton key={i} className="h-72 w-[85%] flex-none rounded-4xl sm:h-36 sm:w-auto" />)
            : data.slice(0, limit).map((s, i) => (
              <div key={s.id} className="flex w-[85%] flex-none snap-start sm:block sm:w-auto">
                <SeminarCard seminar={s} featured={i === 0} />
              </div>
            ))}
        </div>
        <Button variant="secondary" to="/capacitaciones" className="mt-6 w-full sm:hidden">Ver todas las fechas <ArrowRight size={16} aria-hidden="true" /></Button>
      </div>
    </section>
  )
}

// Franja para captar distribuidores.
export function DistributorBand() {
  const distributor = useDistributor()
  return (
    <section className="bg-navy py-16 text-paper lg:py-20">
      <div className="container-x grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-gold">Programa de distribuidores</p>
          <h2 className="display-lg mt-3">Vende DASHU en tu barbería o tienda</h2>
          <p className="mt-4 max-w-xl text-paper/65">
            Compra embalajes cerrados y obtén el mejor precio por crema para revender en tu negocio.
          </p>
        </div>
        <div className="rounded-4xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><Package size={18} className="text-gold" aria-hidden="true" /> Mínimo {distributor.minBoxes} embalajes de {distributor.unitsPerBox} cremas ({distributor.minUnits} u.)</li>
            <li className="flex items-center gap-3"><Store size={18} className="text-gold" aria-hidden="true" /> Cada crema a <strong className="tabular">{formatCLP(distributor.unitCost)}</strong> · total {formatCLP(distributor.minTotal)}</li>
          </ul>
          <Button variant="gold" to="/distribuidores" className="mt-6 w-full">Postular como distribuidor <ArrowRight size={16} aria-hidden="true" /></Button>
        </div>
      </div>
    </section>
  )
}
