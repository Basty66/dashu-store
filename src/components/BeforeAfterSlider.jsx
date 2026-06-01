import { useState, useRef, useCallback, useEffect } from 'react'

const BEFORE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJZO0RwjR7BUryBRYGrm3FVGp-ljpWh5-XwUwswOB6Hw3-flf5uo2CguFIozOvXGLZDQhcCAGVN_N0cup7PLGyHno1Vv5eICp_b2l9uc8xVR93jvNNqa0M6M6PjNfDoa1ApbgKwnO9-45FaAx5eCuGrGDMe5I3qU4YKFhiubfHXq7wv7skEz6GLhkOzC6csrcGEGnIFU6SmYb8XlxanBOQ6PFT5ZF5_SHrA8SAISemdkYSnOJg7Z3V_ON4xiNuBIpVWgbx1Pyl0do'

export default function BeforeAfterSlider({ beforeImage, afterImage }) {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    let x = ((clientX - rect.left) / rect.width) * 100
    x = Math.max(0, Math.min(100, x))
    setSliderPos(x)
  }, [])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    updatePosition(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (isDragging) updatePosition(e.clientX)
  }, [isDragging, updatePosition])

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchMove = useCallback((e) => {
    if (isDragging) updatePosition(e.touches[0].clientX)
  }, [isDragging, updatePosition])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleTouchMove])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-display font-bold text-2xl md:text-3xl text-navy">Antes y Después</h3>
        <p className="font-body text-sm text-gray-500 mt-1">Desliza para ver el resultado</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-reselect select-none bg-gray-100"
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          setIsDragging(true)
          updatePosition(e.touches[0].clientX)
        }}
      >
        <img
          src={afterImage || BEFORE_IMG}
          alt="Después"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImage || BEFORE_IMG}
            alt="Antes"
            className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
            style={{ width: `${100 / (sliderPos / 100)}%` }}
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-navy text-sm">swap_horiz</span>
          </div>
        </div>

        <span className="absolute bottom-4 left-4 font-body text-xs font-medium text-white/80 bg-black/40 px-3 py-1 rounded-full">
          Antes
        </span>
        <span className="absolute bottom-4 right-4 font-body text-xs font-medium text-white/80 bg-black/40 px-3 py-1 rounded-full">
          Después
        </span>
      </div>
    </div>
  )
}
