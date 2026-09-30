import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { formatCLP, packSavings, packUnitPrice, sortPacks, referenceUnitPrice, packLabel } from '@shared/pricing.js'
import { HIGHLIGHT_PACK_UNITS } from '@shared/store.js'
import { useCart } from '../../store/cart'
import { Badge } from '../atoms/Badge'
import { SectionHeading } from '../molecules/SectionHeading'

// Escalera de precios: la barra muestra cuánto pagas por unidad en cada formato.
// En celular cada formato es una fila compacta (sin barra) con botón redondo.
export function VolumePricing({ product }) {
  const add = useCart((s) => s.add)
  const packs = sortPacks(product.packs)
  const ref = referenceUnitPrice(packs)

  function pick(pack) {
    add({ productId: product.id, slug: product.slug, title: product.title, image: product.images[0] || null, packUnits: pack.units, unitPrice: pack.price, quantity: 1 })
  }

  return (
    <section id="precios" className="bg-paper py-14 sm:py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Precios por volumen"
            title="Mientras más llevas, menos pagas por unidad"
            description="Ideal para barberías, peluquerías y reventa. Elige el formato y combínalo como quieras en tu carrito."
          />
          <p className="font-mono text-xs text-muted">Precios finales en pesos chilenos (CLP)</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-sand bg-white sm:mt-12 sm:rounded-4xl">
          <div className="hidden grid-cols-12 gap-4 border-b border-sand px-8 py-4 font-mono text-2xs uppercase tracking-[0.14em] text-muted md:grid">
            <span className="col-span-2">Formato</span>
            <span className="col-span-4">Precio por unidad</span>
            <span className="col-span-2 text-right">Total</span>
            <span className="col-span-2 text-right">Ahorro</span>
            <span className="col-span-2" />
          </div>
          <ul>
            {packs.map((pack, i) => {
              const unit = packUnitPrice(pack)
              const savings = packSavings(pack, packs)
              const highlight = pack.units === HIGHLIGHT_PACK_UNITS
              const disabled = pack.units > product.stock
              return (
                <motion.li
                  key={pack.units}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-sand px-4 py-4 last:border-0 md:grid-cols-12 md:gap-4 md:px-8 md:py-5 ${highlight ? 'bg-gold/[0.06]' : ''}`}
                >
                  <div className="min-w-0 md:col-span-2">
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold md:text-xl" style={{ fontStretch: '115%' }}>
                      {packLabel(pack.units)}
                      {highlight && <Badge tone="goldSolid" className="md:hidden">Más elegido</Badge>}
                    </p>
                    <p className="text-xs text-muted tabular">
                      {pack.units} {pack.units === 1 ? 'unidad' : 'unidades'}
                      <span className="md:hidden"> · {formatCLP(unit)} c/u</span>
                    </p>
                    {highlight && <Badge tone="goldSolid" className="mt-2 hidden md:inline-flex">Más elegido</Badge>}
                  </div>
                  <div className="hidden md:col-span-4 md:block">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bone">
                        <motion.div
                          className="h-full rounded-full bg-ink"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(unit / ref) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="w-24 text-right font-mono text-sm tabular">{formatCLP(unit)}</span>
                    </div>
                  </div>
                  <div className="text-right md:col-span-2">
                    <p className="font-mono text-sm tabular">{formatCLP(pack.price)}</p>
                    {savings.percent > 0 && <p className="text-xs font-medium text-success md:hidden">Ahorras {savings.percent}%</p>}
                  </div>
                  <p className="hidden text-right text-sm md:col-span-2 md:block">
                    {savings.percent > 0 ? <span className="font-medium text-success tabular">−{savings.percent}% · {formatCLP(savings.amount)}</span> : <span className="text-muted">—</span>}
                  </p>
                  <div className="flex justify-end md:col-span-2">
                    <button
                      type="button"
                      onClick={() => pick(pack)}
                      disabled={disabled}
                      aria-label={disabled ? `${packLabel(pack.units)} sin stock` : `Agregar ${packLabel(pack.units)} al carrito`}
                      className="inline-flex h-11 w-11 items-center justify-center gap-1.5 rounded-full border border-ink/15 text-sm font-medium transition-all duration-200 hover:border-ink hover:bg-ink hover:text-paper active:scale-95 disabled:pointer-events-none disabled:opacity-40 md:h-10 md:w-auto md:px-4"
                    >
                      <Plus size={16} aria-hidden="true" />
                      <span className="hidden md:inline">{disabled ? 'Sin stock' : 'Agregar'}</span>
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
