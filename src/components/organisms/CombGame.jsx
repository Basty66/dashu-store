import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

const HEAD = { x: 200, y: 250, r: 104 }
const STRANDS = 44

// Generador pseudoaleatorio con semilla: el peinado siempre sale igual de rebelde.
function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function buildStrands() {
  const rand = seeded(20260929)
  return Array.from({ length: STRANDS }, (_, i) => {
    const t = i / (STRANDS - 1)
    const theta = ((198 + t * 144) * Math.PI) / 180
    const bx = HEAD.x + HEAD.r * Math.cos(theta)
    const by = HEAD.y + HEAD.r * Math.sin(theta)
    const normal = (theta * 180) / Math.PI
    return {
      id: i,
      bx,
      by,
      len: 46 + rand() * 42,
      wild: normal + (rand() - 0.5) * 80, // erizo: hacia afuera, en cualquier dirección
      tame: normal + 84, // peinado: pegado a la cabeza, hacia la derecha
      gold: rand() > 0.82,
    }
  })
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

// Minijuego del 404: pasa el cursor o el dedo sobre el pelo para peinarlo.
export function CombGame({ onDone }) {
  const strands = useMemo(buildStrands, [])
  const [combed, setCombed] = useState(() => new Set())
  const svg = useRef(null)
  const progress = combed.size / STRANDS
  const done = combed.size === STRANDS

  function comb(e) {
    if (done || !svg.current) return
    const point = svg.current.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    const { x, y } = point.matrixTransform(svg.current.getScreenCTM().inverse())
    const hits = strands.filter((s) => {
      if (combed.has(s.id)) return false
      const a = (s.wild * Math.PI) / 180
      return distanceToSegment(x, y, s.bx, s.by, s.bx + s.len * Math.cos(a), s.by + s.len * Math.sin(a)) < 22
    })
    if (!hits.length) return
    const next = new Set(combed)
    hits.forEach((h) => next.add(h.id))
    setCombed(next)
    if (next.size === STRANDS) onDone?.()
  }

  const mouth = progress > 0.8 ? 'M180 300 Q200 318 220 300' : progress > 0.4 ? 'M182 304 Q200 310 218 304' : 'M182 308 Q200 300 218 308'

  return (
    <div className="relative">
      <svg
        ref={svg}
        viewBox="0 0 400 400"
        className="mx-auto w-full max-w-[420px] cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerMove={comb}
        onPointerDown={comb}
        role="img"
        aria-label={`Cabeza con el pelo parado. Peinado: ${Math.round(progress * 100)}%`}
      >
        <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r + 60} fill="#C9A27E" opacity="0.08" />
        {strands.map((s) => {
          const angle = combed.has(s.id) ? s.tame : s.wild
          return (
            <g
              key={s.id}
              style={{
                transform: `translate(${s.bx}px, ${s.by}px) rotate(${angle}deg)`,
                transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <line x1="0" y1="0" x2={combed.has(s.id) ? s.len * 0.62 : s.len} y2="0" stroke={s.gold ? '#C9A27E' : '#171210'} strokeWidth="7" strokeLinecap="round" style={{ transition: 'all 600ms ease-out' }} />
            </g>
          )
        })}
        <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill="#FBF6F2" stroke="#171210" strokeWidth="4" />
        <circle cx="168" cy="262" r="7" fill="#171210" />
        <circle cx="232" cy="262" r="7" fill="#171210" />
        <path d={mouth} fill="none" stroke="#171210" strokeWidth="5" strokeLinecap="round" style={{ transition: 'd 400ms ease-out' }} />
        {progress > 0.8 && <circle cx="150" cy="292" r="10" fill="#E8A0A0" opacity="0.5" />}
        {progress > 0.8 && <circle cx="250" cy="292" r="10" fill="#E8A0A0" opacity="0.5" />}
      </svg>

      <div className="mx-auto mt-2 max-w-xs">
        <div className="flex justify-between font-mono text-2xs uppercase tracking-[0.14em] text-muted">
          <span>Pelos domados</span>
          <span className="tabular">{combed.size}/{STRANDS}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
          <div className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <AnimatePresence>
        {combed.size > 0 && !done && (
          <motion.button
            type="button"
            onClick={() => setCombed(new Set())}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-ink"
          >
            <RotateCcw size={12} aria-hidden="true" /> Despeinar de nuevo
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
