import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { initSmoothScroll, destroySmoothScroll, scrollToTarget } from '../../lib/smoothScroll'
import { AnnouncementBar, Toaster, WhatsAppFab } from '../organisms/Chrome'
import { Header } from '../organisms/Header'
import { Footer } from '../organisms/Footer'
import { CartDrawer } from '../organisms/CartDrawer'

const ease = [0.16, 1, 0.3, 1]
const page = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
}

// Congela el contenido de la ruta que sale, para que no cambie mientras se desvanece.
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

// Espera a que exista el elemento (o la altura suficiente) antes de desplazarse.
function whenReady(check, run, tries = 40) {
  let n = 0
  const timer = setInterval(() => {
    const value = check()
    if (value || ++n > tries) {
      clearInterval(timer)
      if (value) run(value)
    }
  }, 50)
  return () => clearInterval(timer)
}

export function StoreLayout() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map())
  const last = useRef({ key: location.key, path: location.pathname })
  const restoreTo = useRef(null)
  const transitioning = useRef(false)

  useEffect(() => {
    initSmoothScroll()
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    return () => destroySmoothScroll()
  }, [])

  // Al cambiar de URL (antes de cualquier scroll): decide si hay que restaurar una posición guardada.
  useLayoutEffect(() => {
    if (last.current.key === location.key) return
    const pathChanged = last.current.path !== location.pathname
    last.current = { key: location.key, path: location.pathname }
    restoreTo.current = navigationType === 'POP' ? positions.current.get(location.key) ?? null : null
    transitioning.current = pathChanged
  }, [location.key, location.pathname, navigationType])

  // Guarda la posición de cada entrada del historial (salvo durante la transición).
  useEffect(() => {
    let frame = 0
    const save = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!transitioning.current) positions.current.set(location.key, window.scrollY)
      })
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.removeEventListener('scroll', save)
      cancelAnimationFrame(frame)
    }
  }, [location.key])

  // Anclas (ej: /#precios). Al volver con "atrás" manda la posición guardada, no el ancla.
  useEffect(() => {
    if (!location.hash || restoreTo.current !== null) return
    return whenReady(() => document.getElementById(location.hash.slice(1)), (el) => scrollToTarget(el))
  }, [location.hash, location.pathname])

  // Al entrar la nueva página: si venía de "atrás"/"adelante" vuelve a donde estaba el usuario.
  // Se reaplica una vez por si el contenido terminó de cargar después (imágenes, reseñas).
  const afterEnter = useCallback(() => {
    const saved = restoreTo.current
    const done = () => {
      restoreTo.current = null
      transitioning.current = false
    }
    if (saved === null) return done()
    whenReady(() => document.documentElement.scrollHeight >= saved + window.innerHeight, () => {
      scrollToTarget(saved, { immediate: true })
      setTimeout(() => {
        if (Math.abs(window.scrollY - saved) > 2) scrollToTarget(saved, { immediate: true })
        done()
      }, 450)
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Saltar al contenido
      </a>
      <AnnouncementBar />
      <Header overlay={location.pathname === '/'} />
      <main id="contenido" className="flex-1">
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => scrollToTarget(0, { immediate: true })}>
          <motion.div key={location.pathname} variants={page} initial="initial" animate="enter" exit="exit" onAnimationStart={(v) => v === 'enter' && afterEnter()}>
            <FrozenOutlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <Toaster />
      <WhatsAppFab />
    </div>
  )
}
