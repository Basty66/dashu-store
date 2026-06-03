import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { clp } from '../lib/format'

const spring = { type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : '' }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="drawer-overlay" onClick={() => setIsOpen(false)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={spring}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-cream/90 backdrop-blur-2xl shadow-2xl border-l border-white/20">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-v/30">
              <span className="h-md text-navy text-lg">Tu Carrito</span>
              <motion.button onClick={() => setIsOpen(false)} className="p-1.5"
                whileHover={{ rotate: 90 }} transition={{ type: 'spring', damping: 10, stiffness: 200 }}>
                <X size={18} className="text-stone" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={28} strokeWidth={1} className="text-outline-v mb-4" />
                  <p className="text-sm text-stone">Tu carrito está vacío</p>
                </div>
              ) : (
                items.map(item => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-16 h-16 bg-cream/50 rounded overflow-hidden flex-shrink-0 border border-white/10">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-v text-[10px]">IMG</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy">{item.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                          <motion.button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-11 h-11 flex items-center justify-center border border-outline-v/50 rounded hover:bg-white/50 transition-colors"
                          whileTap={{ scale: 0.9 }}>
                          <Minus size={14} className="text-stone" />
                        </motion.button>
                        <span className="text-xs font-medium w-4 text-center text-navy">{item.quantity}</span>
                          <motion.button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-11 h-11 flex items-center justify-center border border-outline-v/50 rounded hover:bg-white/50 transition-colors"
                          whileTap={{ scale: 0.9 }}>
                          <Plus size={14} className="text-stone" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-navy">{clp(item.price * item.quantity)}</p>
                      <motion.button onClick={() => removeItem(item.id)}
                        className="text-xs mt-2 text-outline-v hover:text-stone transition-colors"
                        whileHover={{ scale: 1.05 }}>
                        Eliminar
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-outline-v/30 bg-cream/40 backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone">Subtotal</span>
                  <span className="h-md text-lg text-navy">{clp(subtotal)}</span>
                </div>
                <motion.button onClick={() => { setIsOpen(false); navigate('/checkout') }}
                  className="btn-primary w-full justify-center"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  Proceder al Pago
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
