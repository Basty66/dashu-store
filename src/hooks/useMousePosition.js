import { useState, useEffect, useCallback, useRef } from 'react'

export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

export function useMagneticEffect(ref, strength = 0.3) {
  const [delta, setDelta] = useState({ x: 0, y: 0 })
  const raf = useRef(null)

  const handleMove = useCallback((e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) * strength
    const dy = (e.clientY - cy) * strength
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setDelta({ x: dx, y: dy }))
  }, [ref, strength])

  const handleLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setDelta({ x: 0, y: 0 }))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMove, { passive: true })
    el.addEventListener('mouseleave', handleLeave, { passive: true })
    return () => { el.removeEventListener('mousemove', handleMove); el.removeEventListener('mouseleave', handleLeave) }
  }, [ref, handleMove, handleLeave])

  return delta
}

export function useSpotlight(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    }
    el.addEventListener('mousemove', handler, { passive: true })
    return () => el.removeEventListener('mousemove', handler)
  }, [ref])
}
