import { useState, useRef, useCallback, useEffect } from 'react'

const BEFORE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJZO0RwjR7BUryBRYGrm3FVGp-ljpWh5-XwUwswOB6Hw3-flf5uo2CguFIozOvXGLZDQhcCAGVN_N0cup7PLGyHno1Vv5eICp_b2l9uc8xVR93jvNNqa0M6M6PjNfDoa1ApbgKwnO9-45FaAx5eCuGrGDMe5I3qU4YKFhiubfHXq7wv7skEz6GLhkOzC6csrcGEGnIFU6SmYb8XlxanBOQ6PFT5ZF5_SHrA8SAISemdkYSnOJg7Z3V_ON4xiNuBIpVWgbx1Pyl0do'

export default function BeforeAfterSlider({ beforeImage, afterImage }) {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const update = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  const onDown = useCallback((e) => {
    setDragging(true)
    update('touches' in e ? e.touches[0].clientX : e.clientX)
  }, [update])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => update(e.touches ? e.touches[0].clientX : e.clientX)
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, update])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none bg-mist shadow-lg">
        <img src={afterImage || BEFORE_IMG} alt="Después" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={beforeImage || BEFORE_IMG} alt="Antes" className="absolute top-0 left-0 w-full h-full object-cover max-w-none" style={{ width: `${100 / (pos / 100)}%` }} draggable={false} />
        </div>

        <div className="absolute inset-0" onMouseDown={onDown} onTouchStart={onDown} />

        <div className="absolute top-0 bottom-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
            </svg>
          </div>
        </div>

        <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[11px] font-medium tracking-wide uppercase">
          Antes
        </span>
        <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[11px] font-medium tracking-wide uppercase">
          Después
        </span>
      </div>
    </div>
  )
}
