import { useState, useRef, useCallback, useEffect } from 'react'

const B = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJZO0RwjR7BUryBRYGrm3FVGp-ljpWh5-XwUwswOB6Hw3-flf5uo2CguFIozOvXGLZDQhcCAGVN_N0cup7PLGyHno1Vv5eICp_b2l9uc8xVR93jvNNqa0M6M6PjNfDoa1ApbgKwnO9-45FaAx5eCuGrGDMe5I3qU4YKFhiubfHXq7wv7skEz6GLhkOzC6csrcGEGnIFU6SmYb8XlxanBOQ6PFT5ZF5_SHrA8SAISemdkYSnOJg7Z3V_ON4xiNuBIpVWgbx1Pyl0do'

export default function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const [drag, setDrag] = useState(false)
  const ref = useRef(null)

  const move = useCallback((x) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)))
  }, [])

  const down = useCallback((e) => { setDrag(true); move('touches' in e ? e.touches[0].clientX : e.clientX) }, [move])

  useEffect(() => {
    if (!drag) return
    const m = (e) => move(e.touches ? e.touches[0].clientX : e.clientX)
    const u = () => setDrag(false)
    window.addEventListener('mousemove', m); window.addEventListener('mouseup', u)
    window.addEventListener('touchmove', m, { passive: true }); window.addEventListener('touchend', u)
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('mouseup', u); window.removeEventListener('touchmove', m); window.removeEventListener('touchend', u) }
  }, [drag, move])

  return (
    <div ref={ref} className="relative w-full aspect-[4/3] lg:aspect-[16/7] overflow-hidden cursor-col-resize select-none bg-[#e2d8d3] rounded">
      <img src={B} alt="Después" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={B} alt="Antes" className="absolute top-0 left-0 w-full h-full object-cover max-w-none" style={{ width: `${100 / (pos / 100)}%` }} draggable={false} />
      </div>
      <div className="absolute inset-0" onMouseDown={down} onTouchStart={down} />
      <div className="absolute top-0 bottom-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-white shadow-md" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F2038" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 3 12 9 6" /><polyline points="15 18 21 12 15 6" /></svg>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 glass px-3 py-1.5 text-xs font-semibold tracking-wider uppercase" style={{ color: '#0F2038' }}>Antes</div>
      <div className="absolute bottom-4 right-4 glass-strong px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-white" style={{ background: 'rgba(15,32,56,0.8)', backdropFilter: 'blur(8px)' }}>Después</div>
    </div>
  )
}
