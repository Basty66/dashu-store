import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const P_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, freeShippingRemaining, freeShippingProgress } = useCart()
  const navigate = useNavigate()

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : '' }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="drawer-overlay" onClick={() => setIsOpen(false)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-cream/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-navy/[0.04]">
              <span className="font-semibold text-xs tracking-[0.15em] uppercase text-navy">Carrito</span>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:opacity-50 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-navy"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="px-6 py-3 border-b border-navy/[0.02]">
              {freeShippingRemaining > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 shipping-bar">
                    <div className="shipping-bar-fill" style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-stone shrink-0">${freeShippingRemaining.toLocaleString('es-CL')} para envío gratis</p>
                </div>
              ) : (
                <p className="text-[11px] text-gold font-medium text-center">¡Envío gratis!</p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8580" strokeWidth="1" className="mb-4">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <p className="text-sm text-stone">Tu carrito está vacío</p>
                  <button onClick={() => setIsOpen(false)} className="mt-4 text-[11px] tracking-wider uppercase underline underline-offset-4 text-navy/40 hover:text-navy transition-colors">Seguir comprando</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(item => (
                    <motion.div key={item.id} layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-3">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-cream flex-shrink-0 overflow-hidden">
                          <img src={item.image || P_IMG} alt={item.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                          <p className="text-sm text-navy/60 mt-0.5">${item.price.toLocaleString('es-CL')}</p>
                          {item.stock !== undefined && item.stock <= 8 && (
                            <p className="text-[10px] text-gold font-medium mt-1">¡Solo {item.stock} unidades!</p>
                          )}
                          <div className="flex items-center gap-2.5 mt-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-navy/8 hover:bg-navy/5 transition-colors text-xs text-navy/50">−</button>
                            <span className="text-xs font-medium text-navy w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-navy/8 hover:bg-navy/5 transition-colors text-xs text-navy/50">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="self-start p-1 hover:opacity-50 transition-opacity">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-navy/[0.04]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-stone">Subtotal</span>
                  <span className="font-display font-bold text-lg text-navy">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <button onClick={() => { setIsOpen(false); navigate('/checkout') }} className="btn-primary w-full justify-center text-xs">
                  Proceder al Pago
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
