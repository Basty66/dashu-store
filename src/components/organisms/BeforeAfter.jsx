import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useConfig } from '../../store/storeConfig'
import { smallImage } from '../../lib/responsiveImage'
import { SectionHeading } from '../molecules/SectionHeading'
import { CompareSlider } from '../molecules/CompareSlider'
import { InstagramReels } from './InstagramReels'
import { ResultsRing } from './ResultsRing'

const ease = [0.16, 1, 0.3, 1]
const arrow = 'grid h-11 w-11 flex-none place-items-center rounded-full border border-ink/15 bg-paper transition-all duration-200 hover:border-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

// Miniaturas para cambiar de caso (en vez de deslizar, para no chocar con el comparador).
function CaseThumbs({ results, index, onSelect }) {
  const go = (dir) => onSelect((index + dir + results.length) % results.length)
  return (
    <div className="mt-5 flex items-center gap-3">
      <button type="button" onClick={() => go(-1)} className={arrow} aria-label="Caso anterior"><ChevronLeft size={18} aria-hidden="true" /></button>
      <ul className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
        {results.map((r, i) => (
          <li key={`${r.after}-${i}`} className="flex-none">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Ver caso ${i + 1}${r.caption ? `: ${r.caption}` : ''}`}
              aria-current={i === index ? 'true' : undefined}
              className={`block h-14 w-14 overflow-hidden rounded-2xl ring-offset-2 ring-offset-bone transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${i === index ? 'ring-2 ring-ink' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={smallImage(r.after)} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
      <span className="hidden font-mono text-xs text-muted tabular sm:block" aria-live="polite">{index + 1} / {results.length}</span>
      <button type="button" onClick={() => go(1)} className={arrow} aria-label="Caso siguiente"><ChevronRight size={18} aria-hidden="true" /></button>
    </div>
  )
}

// Antes y después (Admin → Ajustes): comparador por caso, galería 360 de pares y reels de Instagram.
export function BeforeAfter() {
  const results = useConfig((c) => c.results)
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const i = Math.min(index, results.length - 1)
  const item = results[i]

  return (
    <section className="bg-bone py-14 sm:py-20 lg:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Antes y después" title="Del erizo al peinado" description="Desliza para comparar. El efecto se concentra en el pelo lateral que se levanta." />
          <ul className="mt-8 space-y-3 text-sm">
            {['Pelo lateral tipo erizo', 'Volumen excesivo en los costados', 'Se levanta con el viento o la humedad'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-muted"><X size={16} className="text-danger" aria-hidden="true" />{t}</li>
            ))}
            {['Costados lisos y disciplinados', 'Peinado rápido todas las mañanas', 'Resultado natural, sin rigidez'].map((t) => (
              <li key={t} className="flex items-center gap-3"><Check size={16} className="text-success" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>

        {/* Tamaño contenido en todo dispositivo: ancho según pantalla y nunca más alto que ~65% del alto visible. */}
        <figure className="mx-auto w-full min-w-0 max-w-[min(300px,calc(65svh*0.8))] sm:max-w-[min(380px,calc(65svh*0.8))] lg:col-span-7 lg:max-w-[min(440px,calc(65svh*0.8))]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.35, ease }}
            >
              <CompareSlider before={item.before} after={item.after} beforeAlt={`Antes${item.caption ? `: ${item.caption}` : ''}`} afterAlt={`Después${item.caption ? `: ${item.caption}` : ''}`} />
            </motion.div>
          </AnimatePresence>
          <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted">
            {item.caption && <span className="text-sm font-medium text-ink">{item.caption}</span>}
            <span>{item.reference ? 'Imagen referencial. Los resultados varían según el tipo y largo del cabello.' : 'Resultado real de cliente. Puede variar según el tipo y largo del cabello.'}</span>
          </figcaption>
          {results.length > 1 && <CaseThumbs results={results} index={i} onSelect={setIndex} />}
        </figure>
      </div>
      <div className="container-x mt-16 sm:mt-24">
        <ResultsRing />
      </div>
      <div className="container-x mt-16 sm:mt-24">
        <InstagramReels />
      </div>
    </section>
  )
}
