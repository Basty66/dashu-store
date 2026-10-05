import { useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { imageSrcSet } from '../../lib/responsiveImage'

// Comparador deslizable antes/después (fotos verticales 4:5). Funciona con mouse, touch y teclado (input range accesible).
export function CompareSlider({ before, after, beforeAlt = 'Antes', afterAlt = 'Después' }) {
  const [pos, setPos] = useState(50)
  const box = useRef(null)
  const dragging = useRef(false)

  function moveTo(clientX) {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={box}
      className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-3xl bg-sand shadow-lift sm:rounded-4xl"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        moveTo(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <img src={after} srcSet={imageSrcSet(after)} sizes="(min-width: 1024px) 560px, 100vw" alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable="false" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} srcSet={imageSrcSet(before)} sizes="(min-width: 1024px) 560px, 100vw" alt={beforeAlt} className="h-full w-full object-cover" loading="lazy" draggable="false" />
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
  )
}
