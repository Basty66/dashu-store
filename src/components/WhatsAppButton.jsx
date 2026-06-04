import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const PHONE = '56912345678'
const MESSAGE = 'Hola%20DASHU%2C%20quiero%20consultar%20por%20sus%20productos'

export default function WhatsAppButton() {
  const [show, setShow] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 300) setShow(true)
      else setShow(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-4 max-w-[260px] border border-outline-v/10">
                <p className="text-sm text-navy font-medium mb-1">¡Hola! 👋</p>
                <p className="text-xs text-stone leading-relaxed">¿Tienes dudas sobre nuestros productos? Escríbenos directo a WhatsApp.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.a href={`https://wa.me/${PHONE}?text=${MESSAGE}`} target="_blank" rel="noopener noreferrer"
            onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
            className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {open ? <X size={22} className="text-white" /> : <MessageCircle size={26} className="text-white" />}
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
