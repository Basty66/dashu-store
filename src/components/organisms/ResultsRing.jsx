import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useConfig } from '../../store/storeConfig'
import { ResultPair } from '../molecules/ResultPair'

const ease = [0.16, 1, 0.3, 1]
const INTERVAL = 3500
// Giro rápido y sin rebote largo (~0,5 s).
const SPIN = { type: 'spring', stiffness: 170, damping: 26, mass: 0.9 }
const control = 'grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-paper transition-all duration-200 hover:border-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

function useWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return width
}

// Distancia más corta (con signo) entre dos posiciones de un anillo de n elementos.
const circularDelta = (from, to, n) => {
  const d = (((to - from) % n) + n) % n
  return d > n / 2 ? d - n : d
}

// Carrusel 360: los pares antes/después giran en un anillo 3D. El par activo queda al frente y los
// vecinos se asoman atenuados detrás; al cambiar, el anillo rota y el par del frente pasa hacia atrás.
export function ResultsRing() {
  const results = useConfig((c) => c.results)
  const n = results.length
  const reduce = useReducedMotion()
  const stageRef = useRef(null)
  const width = useWidth(stageRef)
  const [turn, setTurn] = useState(0) // sin límite: el anillo siempre gira en el sentido elegido
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false) // mouse encima o foco adentro
  const [visible, setVisible] = useState(false)
  const active = ((turn % n) + n) % n
  const go = useCallback((delta) => setTurn((t) => t + delta), [])
  const step = n ? 360 / n : 0
  const rotation = useMotionValue(0)
  const dragging = useRef(false)

  // Gira el anillo hasta el caso elegido (salvo mientras se arrastra con el dedo o el mouse).
  useEffect(() => {
    if (dragging.current) return undefined
    const controls = animate(rotation, -turn * step, reduce ? { duration: 0 } : SPIN)
    return () => controls.stop()
  }, [turn, step, reduce, rotation])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduce || paused || holding || !visible || n < 2) return undefined
    const t = setInterval(() => go(1), INTERVAL)
    return () => clearInterval(t)
  }, [reduce, paused, holding, visible, n, go])

  if (n < 2) return null
  // En celular el par ocupa ~84% del ancho para que los vecinos se asomen a ambos lados.
  const pairWidth = Math.min(width < 640 ? width * 0.84 : width, 620)
  const gap = width < 640 ? 8 : 16
  const pairHeight = ((pairWidth - gap) / 2) * 1.25
  const radius = n > 2 ? pairWidth / 2 / Math.tan(Math.PI / n) + pairWidth * 0.12 : pairWidth * 0.6
  const item = results[active]
  const degPerPx = step / (pairWidth * 0.7) // arrastrar ~70% del par gira un caso

  // Arrastre: el anillo sigue al dedo y al soltar se acomoda en el caso más cercano (según el impulso).
  const onPanEnd = (event, info) => {
    dragging.current = false
    if (event.pointerType !== 'mouse') setHolding(false)
    const moved = -Math.round(((info.offset.x + info.velocity.x * 0.08) * degPerPx) / step)
    const delta = Math.max(-2, Math.min(2, moved)) // como máximo 2 casos por gesto
    if (delta === 0) animate(rotation, -turn * step, reduce ? { duration: 0 } : SPIN)
    else go(delta)
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Galería de resultados"
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocusCapture={() => setHolding(true)}
      onBlurCapture={() => setHolding(false)}
      onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : null)}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Galería de resultados</p>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Clientes reales, de a dos fotos</h3>
        </div>
        <p className="whitespace-nowrap font-mono text-xs text-muted tabular" aria-live="polite">{active + 1} / {n}</p>
      </div>

      <div ref={stageRef} className="relative mt-6 overflow-hidden" style={{ height: pairHeight + 48, perspective: width < 640 ? 1000 : 1600 }}>
        <div aria-hidden="true" className="absolute bottom-3 left-1/2 h-6 w-2/3 max-w-md -translate-x-1/2 rounded-full bg-ink/25 blur-2xl" />
        {width > 0 && (
          <motion.div
            className="absolute left-1/2 top-4"
            style={{ width: pairWidth, height: pairHeight, marginLeft: -pairWidth / 2, transformStyle: 'preserve-3d', z: -radius, rotateY: rotation }}
          >
            {results.map((r, i) => {
              const distance = Math.abs(circularDelta(active, i, n))
              return (
                <div
                  key={`${r.after}-${i}`}
                  role="group"
                  aria-roledescription="caso"
                  aria-label={`Caso ${i + 1} de ${n}`}
                  aria-hidden={distance !== 0}
                  className="absolute inset-0"
                  style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <motion.div className="h-full" animate={{ opacity: distance === 0 ? 1 : distance === 1 ? 0.45 : 0.15 }} transition={{ duration: 0.6, ease }}>
                    <ResultPair item={r} />
                  </motion.div>
                </div>
              )
            })}
          </motion.div>
        )}
        {/* Capa para arrastrar con el dedo o el mouse (el scroll vertical de la página sigue funcionando). */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          onPanStart={() => {
            dragging.current = true
            setHolding(true)
          }}
          onPan={(_, info) => rotation.set(-turn * step + info.offset.x * degPerPx)}
          onPanEnd={onPanEnd}
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={active} className="min-h-[1.5rem] text-center text-sm font-medium" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
            {item.caption}
            <span className="ml-2 font-normal text-muted">{item.reference ? '· Imagen referencial' : '· Cliente real'}</span>
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => go(-1)} className={control} aria-label="Caso anterior"><ChevronLeft size={18} aria-hidden="true" /></button>
          <div className="flex sm:gap-1.5">
            {results.map((r, i) => (
              <button
                key={`${r.after}-dot-${i}`}
                type="button"
                onClick={() => go(circularDelta(active, i, n))}
                aria-label={`Ver caso ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
                className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-ink' : 'w-1.5 bg-ink/25'}`} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(1)} className={control} aria-label="Caso siguiente"><ChevronRight size={18} aria-hidden="true" /></button>
          {!reduce && (
            <button type="button" onClick={() => setPaused((p) => !p)} className={control} aria-label={paused ? 'Reanudar galería' : 'Pausar galería'} aria-pressed={paused}>
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
