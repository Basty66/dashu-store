import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { FREE_SHIPPING_FROM } from '@shared/shipping.js'
import { formatCLP } from '@shared/pricing.js'
import { useToasts } from '../../store/toast'
import { whatsappLink } from '../../lib/contact'

const messages = [
  'Envío a todo Chile con seguimiento',
  'Packs de 5, 10, 20 y 40 con precio por volumen',
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
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
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

export function WhatsAppFab() {
  const href = whatsappLink()
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-200 ease-out hover:scale-105 active:scale-95 md:grid"
      aria-label="Escríbenos por WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  )
}
