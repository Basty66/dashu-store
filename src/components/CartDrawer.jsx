import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const PRODUCT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-semibold text-lg text-navy">Tu Carrito</h2>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
                <p className="font-body text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-cream/50">
                    <img
                      src={item.image || PRODUCT_IMG}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-sm text-navy">{item.name}</h3>
                      <p className="text-sm font-medium text-navy mt-1">
                        ${item.price.toLocaleString('es-CL')}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="self-start p-1 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="font-body text-sm text-gray-500">Subtotal</span>
                <span className="font-display font-semibold text-lg text-navy">
                  ${subtotal.toLocaleString('es-CL')}
                </span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full justify-center">
                Proceder al Pago
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
