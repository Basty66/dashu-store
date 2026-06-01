import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'

const REGIONS = ['Región Metropolitana', 'Valparaíso', 'Biobío', 'Antofagasta', 'La Araucanía']

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
    setError('')
    setLoading(true)

    try {
      const order = await api.orders.create({
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, unit_price: i.price })),
        total: subtotal,
      })

      const webpay = await api.payments.webpayCreate({
        orderNumber: order.order_number,
        amount: subtotal,
        sessionId: Date.now().toString(),
      })

      const formEl = document.createElement('form')
      formEl.method = 'POST'
      formEl.action = webpay.url
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'token_ws'
      input.value = webpay.token
      formEl.appendChild(input)
      document.body.appendChild(formEl)
      formEl.submit()

      clearCart()
    } catch (err) {
      setError(err.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-navy mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg text-navy">Datos de Envío</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                  <input
                    type="text" name="name" required value={form.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email" name="email" required value={form.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
                    placeholder="juan@email.cl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Región</label>
                  <select
                    name="region" required value={form.region} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm bg-white"
                  >
                    <option value="">Seleccionar</option>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Ciudad</label>
                  <input
                    type="text" name="city" required value={form.city} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
                    placeholder="Santiago"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
                  <input
                    type="text" name="address" required value={form.address} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
                    placeholder="Av. Providencia 1234, Depto 56"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg text-navy mb-4">Método de Pago</h2>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy/5 border border-navy/20">
                <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">credit_card</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-navy">Webpay Plus</p>
                  <p className="text-xs text-gray-400">Tarjetas de crédito, débito y Redcompra</p>
                </div>
                <span className="ml-auto text-xs text-navy font-medium bg-navy/10 px-3 py-1 rounded-full">Seleccionado</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg text-navy mb-4">Resumen</h2>

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-cream flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-medium text-gray-400">Calculando...</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-navy border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="btn-primary w-full justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>Procesando...</>
                ) : (
                  <>
                    Pagar con Webpay
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Transacción 100% segura. Tus datos están protegidos.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
