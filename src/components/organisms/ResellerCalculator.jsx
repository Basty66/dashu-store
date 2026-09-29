import { useMemo, useState } from 'react'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { formatCLP, packUnitPrice, sortPacks, referenceUnitPrice, packLabel } from '@shared/pricing.js'
import { WHOLESALE_CONTACT_FROM_UNITS } from '@shared/store.js'
import { whatsappLink } from '../../lib/contact'
import { Button } from '../atoms/Button'
import { SectionHeading } from '../molecules/SectionHeading'

// Calculadora para barberías y revendedores: inversión, venta y ganancia estimada por pack.
export function ResellerCalculator({ product }) {
  const packs = useMemo(() => sortPacks(product.packs).filter((p) => p.units > 1), [product.packs])
  const [units, setUnits] = useState(packs.find((p) => p.units === 20)?.units || packs.at(-1)?.units)
  const [salePrice, setSalePrice] = useState(() => Math.round(referenceUnitPrice(product.packs) * 1.4 / 500) * 500)
  const pack = packs.find((p) => p.units === units)
  if (!pack) return null

  const cost = packUnitPrice(pack)
  const invest = pack.price
  const revenue = salePrice * pack.units
  const profit = revenue - invest
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const wa = whatsappLink(`Hola, tengo un negocio y quiero cotizar más de ${WHOLESALE_CONTACT_FROM_UNITS} unidades de ${product.title}`)

  return (
    <section id="revendedores" className="py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Para barberías y revendedores"
            title="Calcula tu ganancia antes de comprar"
            description="Elige un pack y el precio al que venderías cada unidad. Los packs vienen con boleta o factura y despacho a todo Chile."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#comprar">Elegir mi pack <ArrowRight size={16} aria-hidden="true" /></Button>
            {wa && (
              <Button variant="secondary" href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> Cotizar +{WHOLESALE_CONTACT_FROM_UNITS} unidades
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-4xl bg-ink p-6 text-paper shadow-lift sm:p-10 lg:col-span-7">
          <p className="eyebrow text-gold">Simulador</p>
          <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Pack">
            {packs.map((p) => (
              <button
                key={p.units}
                type="button"
                role="radio"
                aria-checked={p.units === units}
                onClick={() => setUnits(p.units)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${p.units === units ? 'bg-gold text-ink' : 'bg-white/5 text-paper/80 hover:bg-white/10'}`}
              >
                {packLabel(p.units)}
              </button>
            ))}
          </div>

          <label className="mt-8 block">
            <span className="flex items-baseline justify-between text-sm text-paper/70">
              Precio de venta por unidad
              <span className="font-display text-2xl font-bold text-paper tabular">{formatCLP(salePrice)}</span>
            </span>
            <input
              type="range"
              min={Math.max(1000, Math.round(cost / 500) * 500)}
              max={Math.round((cost * 3) / 500) * 500}
              step={500}
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="mt-4 w-full accent-[#C3A06A]"
            />
          </label>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-4">
            {[
              ['Costo c/u', formatCLP(cost)],
              ['Inviertes', formatCLP(invest)],
              ['Vendes', formatCLP(revenue)],
              ['Ganas', formatCLP(profit)],
            ].map(([k, v], i) => (
              <div key={k} className={`p-5 ${i === 3 ? 'bg-gold text-ink' : 'bg-ink'}`}>
                <dt className={`eyebrow ${i === 3 ? 'text-ink/70' : 'text-paper/45'}`}>{k}</dt>
                <dd className="mt-2 font-display text-xl font-bold tabular sm:text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-paper/50">
            Margen estimado {margin}% · Cálculo referencial, no incluye envío ni impuestos de tu negocio.
          </p>
        </div>
      </div>
    </section>
  )
}
