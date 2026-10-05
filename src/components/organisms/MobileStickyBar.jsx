import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUi } from '../../store/ui'

const ease = [0.16, 1, 0.3, 1]

/**
 * Barra fija inferior solo para celular. Aparece cuando el elemento `targetId` sale de pantalla:
 *  - mode "after":  cuando el usuario ya pasó el objetivo (ej: bajó más allá de la caja de compra)
 *  - mode "before": mientras el objetivo aún está más abajo (ej: formulario al final de la página)
 * Se oculta sobre el footer para no taparlo.
 */
export function MobileStickyBar({ targetId, mode = 'after', children }) {
  const [visible, setVisible] = useState(false)
  const setBottomBar = useUi((s) => s.setBottomBar)

  useEffect(() => {
    let observer
    let tries = 0
    let timer
    const state = { target: 'inside', footer: false }
    const update = () => {
      const show = mode === 'after' ? state.target === 'above' : state.target === 'below'
      setVisible(show && !state.footer)
    }
    const start = () => {
      const target = document.getElementById(targetId)
      if (!target) {
        if (++tries < 40) timer = setTimeout(start, 100)
        return
      }
      const footer = document.querySelector('footer')
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === footer) state.footer = entry.isIntersecting
          else state.target = entry.isIntersecting ? 'inside' : entry.boundingClientRect.top < 0 ? 'above' : 'below'
        }
        update()
      })
      observer.observe(target)
      if (footer) observer.observe(footer)
    }
    start()
    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [targetId, mode])

  useEffect(() => {
    setBottomBar(visible)
    return () => setBottomBar(false)
  }, [visible, setBottomBar])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-paper/95 px-4 pt-3 shadow-[0_-12px_32px_-16px_rgba(23,18,16,0.25)] backdrop-blur-xl lg:hidden"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
