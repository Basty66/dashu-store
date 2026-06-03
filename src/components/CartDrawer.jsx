import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
<<<<<<< HEAD
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { clp } from '../lib/format'
=======

const P_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b

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
<<<<<<< HEAD
                <X size={18} className="text-stone" />
=======
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
<<<<<<< HEAD
                  <ShoppingBag size={28} strokeWidth={1} className="text-outline-v mb-4" />
=======
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#75777e" strokeWidth="1" className="mb-4">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
                  <p className="text-sm text-stone">Tu carrito está vacío</p>
                </div>
              ) : (
                items.map(item => (
<<<<<<< HEAD
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
=======
                  <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-16 h-16 bg-cream/50 rounded overflow-hidden flex-shrink-0">
                      <img src={item.image || P_IMG} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#0F2038' }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#44474d' }}>120ml</p>
                      <div className="flex items-center gap-2 mt-2">
                        <motion.button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-outline-v rounded hover:bg-white/50 transition-colors text-xs" whileTap={{ scale: 0.9 }}>−</motion.button>
                        <span className="text-xs font-medium w-4 text-center" style={{ color: '#0F2038' }}>{item.quantity}</span>
                        <motion.button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-outline-v rounded hover:bg-white/50 transition-colors text-xs" whileTap={{ scale: 0.9 }}>+</motion.button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: '#0F2038' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                      <motion.button onClick={() => removeItem(item.id)} className="text-xs mt-2" style={{ color: '#75777e' }} whileHover={{ scale: 1.1 }}>Eliminar</motion.button>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
<<<<<<< HEAD
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
=======
              <div className="px-6 py-5 border-t border-outline-v/30 bg-cream/40 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm" style={{ color: '#44474d' }}>Subtotal</span>
                  <span className="h-md text-lg" style={{ color: '#0F2038' }}>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <motion.button onClick={() => { setIsOpen(false); navigate('/checkout') }} className="btn-primary w-full justify-center"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  Proceder al Pago
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
