import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { formatCLP, lowestUnitPrice, sortPacks, packUnitPrice } from '@shared/pricing.js'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'

const ease = [0.16, 1, 0.3, 1]
const rise = (delay) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease, delay } })

const chips = [
  { text: 'Sin plancha ni calor', className: 'left-[2%] top-[18%]', delay: 0.9 },
  { text: 'Cysteamine + proteína de seda', className: 'right-[0%] top-[42%]', delay: 1.05 },
  { text: 'Dura 3 a 4 semanas', className: 'left-[8%] bottom-[16%]', delay: 1.2 },
]

export function Hero({ product }) {
  const reduce = useReducedMotion()
  const packs = product ? sortPacks(product.packs) : []
  const biggest = packs.at(-1)

  return (
    <section className="grain relative -mt-16 overflow-hidden bg-navy text-paper lg:-mt-[72px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-10 h-[640px] w-[640px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-navy-600/60 blur-[100px]" />
      </div>

      <div className="container-x relative grid min-h-[min(92svh,860px)] items-center gap-10 pb-16 pt-28 lg:grid-cols-12 lg:pb-20 lg:pt-32">
        <div className="relative z-10 lg:col-span-6">
          <motion.div {...rise(0.05)}>
            <Badge tone="light">DASHU · Origen Corea del Sur</Badge>
          </motion.div>
          <motion.h1 className="display-xl mt-6 text-balance" {...rise(0.15)}>
            Domina el pelo rebelde en{' '}
            <span className="font-serif font-normal italic text-gold" style={{ fontStretch: '100%', letterSpacing: '-0.01em' }}>
              10 minutos.
            </span>
          </motion.h1>
          <motion.p className="mt-6 max-w-md text-lg leading-relaxed text-paper/70" {...rise(0.25)}>
            {product ? `${product.brand} ${product.title}` : 'DASHU Down Permanent'}: alisado de origen coreano, sin plancha ni calor. Compra por unidad o en packs para tu barbería o reventa.
          </motion.p>
          <motion.div className="mt-9 flex flex-col gap-3 sm:flex-row" {...rise(0.35)}>
            <Button variant="gold" size="lg" href="#comprar">
              {packs.length ? `Comprar desde ${formatCLP(lowestUnitPrice(packs))} c/u` : 'Comprar ahora'}
              <ArrowDown size={18} aria-hidden="true" />
            </Button>
            <Button variant="outlineLight" size="lg" href="#precios">
              Precios por volumen <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </motion.div>
          <motion.dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6" {...rise(0.45)}>
            {[
              ['Acción', '10 min'],
              ['Duración', '3–4 sem'],
              ['Calor', 'Cero'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow text-paper/45">{k}</dt>
                <dd className="mt-1 whitespace-nowrap font-display text-xl font-bold sm:text-3xl" style={{ fontStretch: '115%' }}>{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative lg:col-span-6">
          <motion.div
            className="relative mx-auto aspect-square w-full max-w-[600px]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.2 }}
          >
            <img
              src="/img/product-hero.webp"
              srcSet="/img/product-hero-560.webp 560w, /img/product-hero.webp 1024w"
              sizes="(min-width: 1024px) 600px, 92vw"
              alt={product ? `${product.brand} ${product.title}` : 'DASHU Down Permanent'}
              className="h-full w-full object-cover"
              style={{ WebkitMaskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)', maskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)' }}
              fetchPriority="high"
            />
            {chips.map((chip) => (
              <motion.span
                key={chip.text}
                className={`absolute hidden rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-medium text-paper/90 backdrop-blur-md sm:block ${chip.className}`}
                initial={{ opacity: 0, y: 12 }}
                animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
                transition={reduce ? { delay: chip.delay } : { opacity: { delay: chip.delay, duration: 0.6 }, y: { delay: chip.delay, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
              >
                {chip.text}
              </motion.span>
            ))}
            {biggest && biggest.units > 1 && (
              <motion.div
                className="absolute bottom-[4%] right-[4%] rounded-2xl bg-paper px-5 py-4 text-ink shadow-lift"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.7, ease }}
              >
                <p className="eyebrow text-gold-deep">Pack {biggest.units}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular">{formatCLP(packUnitPrice(biggest))}<span className="text-sm font-normal text-muted"> c/u</span></p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Marquee() {
  const words = ['Sin plancha', 'Sin calor', '10 minutos', 'Origen Corea', 'Dura 3–4 semanas', 'Packs por volumen', 'Envío a todo Chile']
  const row = [...words, ...words]
  return (
    <div className="overflow-hidden border-y border-ink/10 bg-gold py-4 text-ink" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-lg font-extrabold uppercase" style={{ fontStretch: '120%' }}>
            {w} <span className="text-[0.6rem]">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
