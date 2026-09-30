import { useMemo, useState } from 'react'
import { ArrowRight, Store } from 'lucide-react'
import { formatCLP, packUnitPrice, sortPacks, referenceUnitPrice, packLabel } from '@shared/pricing.js'
import { DISTRIBUTOR, DISTRIBUTOR_MIN_UNITS, DISTRIBUTOR_MIN_TOTAL } from '@shared/store.js'
import { Button } from '../atoms/Button'
import { SectionHeading } from '../molecules/SectionHeading'

// Calculadora para barberías y revendedores: inversión, venta y ganancia estimada por formato.
export function ResellerCalculator({ product }) {
  const options = useMemo(() => [
    ...sortPacks(product.packs).filter((p) => p.units > 1).map((p) => ({ key: `pack-${p.units}`, label: packLabel(p.units), units: p.units, price: p.price })),
    { key: 'distribuidor', label: `Distribuidor · ${DISTRIBUTOR_MIN_UNITS} u.`, units: DISTRIBUTOR_MIN_UNITS, price: DISTRIBUTOR_MIN_TOTAL },
  ], [product.packs])
  const retail = referenceUnitPrice(product.packs)
  const [key, setKey] = useState('distribuidor')
  const [salePrice, setSalePrice] = useState(retail)
  const option = options.find((o) => o.key === key) || options[0]

  const cost = packUnitPrice(option)
  const revenue = salePrice * option.units
  const profit = revenue - option.price
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const min = Math.max(1000, Math.floor(DISTRIBUTOR.unitCost / 1000) * 1000)
  const max = Math.ceil((retail * 1.6) / 1000) * 1000

  return (
    <section id="revendedores" className="py-14 sm:py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Para barberías y revendedores"
            title="Calcula tu ganancia antes de comprar"
            description={`Compara los packs con el programa de distribuidores: ${DISTRIBUTOR.minBoxes} embalajes de ${DISTRIBUTOR.unitsPerBox} cremas, a ${formatCLP(DISTRIBUTOR.unitCost)} cada una.`}
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/distribuidores"><Store size={16} aria-hidden="true" /> Quiero ser distribuidor</Button>
            <Button variant="secondary" href="#comprar">Comprar un pack <ArrowRight size={16} aria-hidden="true" /></Button>
          </div>
        </div>

        <div className="rounded-4xl bg-ink p-6 text-paper shadow-lift sm:p-10 lg:col-span-7">
          <p className="eyebrow text-gold">Simulador</p>
          <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Formato">
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={o.key === key}
                onClick={() => setKey(o.key)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${o.key === key ? 'bg-gold text-ink' : 'bg-white/5 text-paper/80 hover:bg-white/10'}`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="mt-8 block">
            <span className="flex items-baseline justify-between text-sm text-paper/70">
              Precio de venta por unidad
              <span className="font-display text-2xl font-bold text-paper tabular">{formatCLP(salePrice)}</span>
            </span>
            <input type="range" min={min} max={max} step={500} value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} className="mt-4 w-full accent-[#C9A27E]" />
          </label>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-4">
            {[
              ['Costo c/u', formatCLP(cost)],
              ['Inviertes', formatCLP(option.price)],
              ['Vendes', formatCLP(revenue)],
              ['Ganas', formatCLP(profit)],
            ].map(([k, v], i) => (
              <div key={k} className={`p-5 ${i === 3 ? (profit >= 0 ? 'bg-gold text-ink' : 'bg-danger text-white') : 'bg-ink'}`}>
                <dt className={`eyebrow ${i === 3 ? 'text-ink/70' : 'text-paper/45'}`}>{k}</dt>
                <dd className="mt-2 font-display text-xl font-bold tabular sm:text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-paper/50">
            Margen estimado {margin}% · Referencia: {formatCLP(retail)} es el precio unitario en la tienda. Cálculo referencial, no incluye envío ni impuestos.
          </p>
        </div>
      </div>
    </section>
  )
}
