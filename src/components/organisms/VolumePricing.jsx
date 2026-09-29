import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { formatCLP, packSavings, packUnitPrice, sortPacks, referenceUnitPrice, packLabel } from '@shared/pricing.js'
import { HIGHLIGHT_PACK_UNITS } from '@shared/store.js'
import { useCart } from '../../store/cart'
import { toast } from '../../store/toast'
import { Badge } from '../atoms/Badge'
import { SectionHeading } from '../molecules/SectionHeading'

// Escalera de precios: la barra muestra cuánto pagas por unidad en cada formato.
export function VolumePricing({ product }) {
  const add = useCart((s) => s.add)
  const packs = sortPacks(product.packs)
  const ref = referenceUnitPrice(packs)

  function pick(pack) {
    add({ productId: product.id, slug: product.slug, title: product.title, image: product.images[0] || null, packUnits: pack.units, unitPrice: pack.price, quantity: 1 })
    toast(`${packLabel(pack.units)} agregado al carrito`, 'success')
  }

  return (
    <section id="precios" className="bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Precios por volumen"
            title="Mientras más llevas, menos pagas por unidad"
            description="Ideal para barberías, peluquerías y reventa. Elige el formato y combínalo como quieras en tu carrito."
          />
          <p className="font-mono text-xs text-muted">Precios finales en pesos chilenos (CLP)</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-4xl border border-sand bg-white">
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
                  className={`grid grid-cols-2 items-center gap-4 border-b border-sand px-5 py-5 last:border-0 md:grid-cols-12 md:px-8 ${highlight ? 'bg-gold/[0.06]' : ''}`}
                >
                  <div className="col-span-1 md:col-span-2">
                    <p className="font-display text-xl font-bold" style={{ fontStretch: '115%' }}>{packLabel(pack.units)}</p>
                    <p className="text-xs text-muted">{pack.units} {pack.units === 1 ? 'unidad' : 'unidades'}</p>
                    {highlight && <Badge tone="goldSolid" className="mt-2">Más elegido</Badge>}
                  </div>
                  <div className="col-span-2 row-start-2 md:col-span-4 md:row-start-auto">
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
                  <p className="text-right font-mono text-sm tabular md:col-span-2">{formatCLP(pack.price)}</p>
                  <p className="hidden text-right text-sm md:col-span-2 md:block">
                    {savings.percent > 0 ? <span className="font-medium text-success tabular">−{savings.percent}% · {formatCLP(savings.amount)}</span> : <span className="text-muted">—</span>}
                  </p>
                  <div className="col-span-2 flex justify-end md:col-span-2">
                    <button
                      type="button"
                      onClick={() => pick(pack)}
                      disabled={disabled}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-sm font-medium transition-all duration-200 hover:border-ink hover:bg-ink hover:text-paper active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Plus size={15} aria-hidden="true" /> {disabled ? 'Sin stock' : 'Agregar'}
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
