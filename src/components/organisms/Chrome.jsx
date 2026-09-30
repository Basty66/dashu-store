import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { FREE_SHIPPING_FROM } from '@shared/shipping.js'
import { formatCLP } from '@shared/pricing.js'
import { useToasts } from '../../store/toast'
import { useUi } from '../../store/ui'
import { whatsappLink } from '../../lib/contact'

const messages = [
  'Envío a todo Chile con seguimiento',
  'Packs de 3 y 10 cremas con precio por volumen',
  FREE_SHIPPING_FROM !== null ? `Envío gratis desde ${formatCLP(FREE_SHIPPING_FROM)}` : 'Boleta o factura para tu negocio',
  'Paga seguro con Mercado Pago',
]

export function AnnouncementBar() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative h-9 overflow-hidden bg-ink text-paper" role="region" aria-label="Anuncios">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] uppercase tracking-[0.16em]"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {messages[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  return (
    // En celular los avisos van arriba para no tapar los botones de la parte baja.
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:top-auto" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-lift"
          >
            {t.tone === 'error' ? <AlertCircle size={16} className="text-red-300" /> : <CheckCircle2 size={16} className="text-gold" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// En celular: no tapa los botones del inicio (aparece al bajar), se esconde en el
// checkout y mientras se escribe en un formulario, y sube sobre la barra fija de compra.
export function WhatsAppFab() {
  const href = whatsappLink()
  const bottomBar = useUi((s) => s.bottomBar)
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const isField = (el) => el instanceof Element && el.matches('input, textarea, select')
    const onIn = (e) => isField(e.target) && setTyping(true)
    const onOut = (e) => isField(e.target) && setTyping(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  if (!href) return null
  const hiddenOnMobile = typing || pathname === '/checkout' || (pathname === '/' && !scrolled)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-all duration-300 ease-out hover:scale-105 active:scale-95 md:bottom-6 md:right-6 md:h-14 md:w-14 ${
        bottomBar ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
      } ${hiddenOnMobile ? 'max-md:invisible max-md:translate-y-4 max-md:opacity-0' : ''}`}
      aria-label="Escríbenos por WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  )
}
