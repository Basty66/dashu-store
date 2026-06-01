import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const PRODUCT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    setIsOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-all duration-400 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-ivory z-50 transform transition-all duration-500 ease-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
          <h2 className="font-display font-semibold text-lg text-charcoal">Tu Carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="font-body text-sm text-slate">Tu carrito está vacío</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-xs text-charcoal underline underline-offset-4 hover:no-underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-5 p-4 rounded-2xl bg-white border border-black/5">
                  <div className="w-20 h-20 rounded-xl bg-mist flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image || PRODUCT_IMG}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-charcoal truncate">{item.name}</h3>
                    <p className="text-sm font-medium text-charcoal mt-1">
                      ${item.price.toLocaleString('es-CL')}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-1.5 rounded-full hover:bg-red-50 text-slate hover:text-red-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-8 py-6 border-t border-black/5 bg-white/50">
            <div className="flex justify-between items-center mb-5">
              <span className="font-body text-sm text-slate">Subtotal</span>
              <span className="font-display font-semibold text-xl text-charcoal">
                ${subtotal.toLocaleString('es-CL')}
              </span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full justify-center text-sm">
              Proceder al Pago
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
