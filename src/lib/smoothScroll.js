// Scroll suave con inercia (Lenis) + utilidades para anclas y bloqueo de scroll.
// Si el usuario pidió "reducir movimiento" en su sistema, se usa el scroll nativo.
import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const easeOutExpo = (t) => Math.min(1, 1.001 - 2 ** (-10 * t))

let lenis = null
let locks = 0

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll() {
  if (lenis || typeof window === 'undefined' || prefersReducedMotion()) return lenis
  lenis = new Lenis({
    autoRaf: true,
    duration: 1.15,
    easing: easeOutExpo,
    anchors: { duration: 1.2 },
    // Zonas con su propio scroll (carrito, menú, textos largos) usan el scroll nativo.
    prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent], textarea')),
  })
  if (locks > 0) lenis.stop()
  return lenis
}

export function destroySmoothScroll() {
  lenis?.destroy()
  lenis = null
}

// Desplaza a un número de píxeles, un selector o un elemento.
// El espacio del header fijo lo da el scroll-padding-top del CSS (Lenis y el navegador lo respetan).
export function scrollToTarget(target, { immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, duration: 1.2, force: true })
    return
  }
  const behavior = immediate || prefersReducedMotion() ? 'auto' : 'smooth'
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior, block: 'start' })
}

function lock() {
  locks += 1
  if (locks === 1) {
    lenis?.stop()
    document.body.style.overflow = 'hidden'
  }
}

function unlock() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) {
    lenis?.start()
    document.body.style.overflow = ''
  }
}

// Bloquea el scroll de fondo mientras `active` sea true (soporta varios paneles a la vez).
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    lock()
    return unlock
  }, [active])
}
