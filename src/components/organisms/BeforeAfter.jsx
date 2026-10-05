import { useRef, useState } from 'react'
import { MoveHorizontal, X, Check } from 'lucide-react'
import { SectionHeading } from '../molecules/SectionHeading'
import { InstagramReels } from './InstagramReels'

const srcSet = (src) => (src.endsWith('.webp') ? `${src.replace('.webp', '-800.webp')} 800w, ${src} 1408w` : undefined)

// Comparador deslizable. Funciona con mouse, touch y teclado (input range accesible).
export function BeforeAfter({ before = '/img/antes.webp', after = '/img/despues.webp' }) {
  const [pos, setPos] = useState(50)
  const box = useRef(null)
  const dragging = useRef(false)

  function moveTo(clientX) {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <section className="bg-bone py-14 sm:py-20 lg:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
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

        <figure className="lg:col-span-8">
          <div
            ref={box}
            className="relative aspect-[4/5] select-none sm:aspect-[1408/768] overflow-hidden rounded-4xl bg-sand shadow-lift touch-pan-y"
            onPointerDown={(e) => {
              dragging.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              moveTo(e.clientX)
            }}
            onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
          >
            <img src={after} srcSet={srcSet(after)} sizes="(min-width: 1024px) 60vw, 100vw" alt="Después: pelo lateral liso y peinado" className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable="false" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img src={before} srcSet={srcSet(before)} sizes="(min-width: 1024px) 60vw, 100vw" alt="Antes: pelo lateral levantado" className="h-full w-full object-cover" loading="lazy" draggable="false" />
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.14em] text-paper backdrop-blur">Antes</span>
            <span className="absolute right-4 top-4 rounded-full bg-paper/80 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.14em] text-ink backdrop-blur">Después</span>
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-paper" style={{ left: `${pos}%` }}>
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink shadow-lift">
                <MoveHorizontal size={20} aria-hidden="true" />
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(pos)}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Comparar antes y después"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
          <figcaption className="mt-3 text-xs text-muted">Imagen referencial. Los resultados varían según el tipo y largo del cabello.</figcaption>
        </figure>
      </div>
      <div className="container-x mt-14 sm:mt-20">
        <InstagramReels />
      </div>
    </section>
  )
}
