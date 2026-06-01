import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const P_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : '' }, [isOpen])

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-parchment z-50 transform transition-all duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
          <span className="font-display font-semibold text-sm tracking-[0.15em] uppercase text-soot">Carrito</span>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:opacity-50 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-soot"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 h-[calc(100%-140px)]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-sm text-stone">Tu carrito está vacío</p>
              <button onClick={() => setIsOpen(false)} className="mt-4 text-xs tracking-wider uppercase underline underline-offset-4 text-soot/50 hover:text-soot transition-colors">Seguir comprando</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-white border border-black/[0.04]">
                  <div className="w-16 h-16 bg-linen flex-shrink-0 overflow-hidden">
                    <img src={item.image || P_IMG} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-soot truncate">{item.name}</p>
                    <p className="text-sm text-soot/70 mt-0.5">${item.price.toLocaleString('es-CL')}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-black/10 hover:bg-black/5 transition-colors text-xs">−</button>
                      <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-black/10 hover:bg-black/5 transition-colors text-xs">+</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="self-start p-1 hover:opacity-50 transition-opacity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-8 py-6 border-t border-black/5">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-stone">Subtotal</span>
              <span className="font-display font-bold text-lg text-soot">${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <button onClick={() => { setIsOpen(false); navigate('/checkout') }} className="btn-primary w-full justify-center text-xs">
              Proceder al Pago
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
