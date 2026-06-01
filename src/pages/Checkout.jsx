import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'

const REGIONS = ['Región Metropolitana', 'Valparaíso', 'Biobío', 'Antofagasta', 'La Araucanía', 'O\'Higgins', 'Maule', 'Los Lagos']

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', region: '', city: '', address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const order = await api.orders.create({
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, unit_price: i.price })),
        total: subtotal,
      })
      const wp = await api.payments.webpayCreate({
        orderNumber: order.order_number, amount: subtotal, sessionId: Date.now().toString(),
      })
      const f = document.createElement('form'); f.method = 'POST'; f.action = wp.url
      const inp = document.createElement('input'); inp.type = 'hidden'; inp.name = 'token_ws'; inp.value = wp.token
      f.appendChild(inp); document.body.appendChild(f); f.submit()
      clearCart()
    } catch (err) {
      setError(err.message || 'Error al procesar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 lg:px-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal tracking-tight mb-10">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="card-premium p-8 space-y-5">
              <h2 className="font-display font-semibold text-base text-charcoal">Datos de Envío</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate mb-1.5">Nombre Completo</label>
                  <input type="text" name="name" required value={form.name} onChange={handleChange} className="input-premium" placeholder="Juan Pérez" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate mb-1.5">Email</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-premium" placeholder="juan@ejemplo.cl" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate mb-1.5">Teléfono</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-premium" placeholder="+56 9 1234 5678" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate mb-1.5">Región</label>
                  <select name="region" required value={form.region} onChange={handleChange} className="select-premium">
                    <option value="">Seleccionar</option>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate mb-1.5">Ciudad</label>
                  <input type="text" name="city" required value={form.city} onChange={handleChange} className="input-premium" placeholder="Santiago" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate mb-1.5">Dirección</label>
                  <input type="text" name="address" required value={form.address} onChange={handleChange} className="input-premium" placeholder="Av. Providencia 1234" />
                </div>
              </div>
            </div>

            <div className="card-premium p-8">
              <h2 className="font-display font-semibold text-base text-charcoal mb-5">Método de Pago</h2>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-charcoal/5 border border-charcoal/10">
                <div className="w-11 h-11 rounded-xl bg-charcoal flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-charcoal">Webpay Plus</p>
                  <p className="text-xs text-slate mt-0.5">Débito, crédito y Redcompra</p>
                </div>
                <span className="ml-auto text-[10px] font-medium text-charcoal bg-charcoal/10 px-3 py-1.5 rounded-full uppercase tracking-wide">Seleccionado</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-premium p-8 sticky top-28">
              <h2 className="font-display font-semibold text-base text-charcoal mb-6">Resumen</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-mist flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                      <p className="text-xs text-slate">Cant: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-charcoal">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate">Subtotal</span><span className="font-medium">${subtotal.toLocaleString('es-CL')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate">Envío</span><span className="text-slate">Calculando...</span></div>
                <div className="flex justify-between font-display font-semibold text-lg text-charcoal border-t border-black/5 pt-4 mt-4">
                  <span>Total</span><span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
              <button type="submit" disabled={loading || items.length === 0}
                className="btn-primary w-full justify-center mt-6 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                {loading ? 'Procesando...' : (
                  <><span>Pagar con Webpay</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate text-center mt-4">Transacción 100% segura · Datos protegidos</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
