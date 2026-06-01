import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const regionsData = {
  'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida', 'Puente Alto', 'San Miguel', 'Vitacura', 'Independencia'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón'],
  'Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón'],
  'O\'Higgins': ['Rancagua', 'San Fernando', 'Rengo'],
  'Maule': ['Talca', 'Curicó', 'Linares', 'Constitución'],
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', region: '', city: '', address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState('webpay')
  const [orderResult, setOrderResult] = useState(null)

  const regions = Object.keys(regionsData)
  const cities = form.region ? regionsData[form.region] : []
  const total = subtotal + 4000

  const createOrder = async () => {
    setLoading(true)
    setOrderResult(null)
    try {
      const body = {
        items: items.map(i => ({ id: i.id, title: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        shipping: { name: form.name, email: form.email, phone: form.phone, region: form.region, city: form.city, address: form.address },
        total,
        method: payment,
      }
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await r.json()
      setOrderResult(data)
      if (payment === 'webpay' && data.url) {
        clearCart()
        window.location.href = data.url
      } else if (payment === 'mercadopago' && data.url) {
        clearCart()
        window.location.href = data.url
      } else if (data.orderNumber) {
        clearCart()
        navigate(`/order/${data.orderNumber}`)
      }
    } catch (e) {
      setOrderResult({ error: 'Error al procesar el pedido. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: '#fff8f5' }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="text-center mb-10">
          <span className="label text-xs" style={{ color: '#755841' }}>Checkout</span>
          <h1 className="h-lg text-3xl mt-2" style={{ color: '#0F2038' }}>Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FORM */}
          <div className="lg:col-span-7 space-y-8">
            <section className="glass p-8 rounded">
              <h2 className="h-md text-navy mb-6">Información de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <input id="name" className="input-minimal w-full" placeholder="Nombre completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <input type="email" className="input-minimal w-full" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="tel" className="input-minimal w-full" placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <select className="input-minimal w-full" value={form.region} onChange={e => setForm({ ...form, region: e.target.value, city: '' })}>
                  <option value="">Región</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select className="input-minimal w-full" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} disabled={!cities.length}>
                  <option value="">Comuna</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="md:col-span-2">
                  <input className="input-minimal w-full" placeholder="Dirección" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <input className="input-minimal w-full" placeholder="Notas del pedido (opcional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded">
              <h2 className="h-md text-navy mb-6">Método de Pago</h2>
              <div className="flex rounded-full bg-white/60 p-1 border border-white/30 max-w-xs">
                {['webpay', 'mercadopago'].map(m => (
                  <button key={m} onClick={() => setPayment(m)}
                    className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${payment === m ? 'bg-navy text-white shadow-sm' : 'text-stone hover:text-navy'}`}>
                    {m === 'webpay' ? 'Webpay' : 'Mercado Pago'}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: '#75777e' }}>{payment === 'webpay' ? 'Débito / Crédito / Prepago' : 'Pago con Mercado Pago'}</p>
            </section>

            <motion.button className="btn-primary w-full justify-center" onClick={createOrder} disabled={loading || items.length === 0}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? 'Procesando...' : `Pagar $${total.toLocaleString('es-CL')}`}
            </motion.button>

            {orderResult?.error && (
              <p className="text-sm text-center mt-4" style={{ color: '#b91c1c' }}>{orderResult.error}</p>
            )}
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-5">
            <div className="glass p-6 rounded sticky top-24 space-y-5">
              <h2 className="h-md text-navy">Resumen</h2>
              {items.length === 0 ? (
                <p className="text-sm text-stone">Tu carrito está vacío</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream/50 flex items-center justify-center flex-shrink-0 border border-white/20">
                      <span className="text-xs text-stone">{item.quantity}x</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#0F2038' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#44474d' }}>Cant: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap" style={{ color: '#0F2038' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                  </div>
                ))
              )}
              <div className="border-t border-outline-v/30 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span style={{ color: '#44474d' }}>Subtotal</span><span style={{ color: '#0F2038' }}>${subtotal.toLocaleString('es-CL')}</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: '#44474d' }}>Envío</span><span style={{ color: '#0F2038' }}>$4.000</span></div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-outline-v/30"><span style={{ color: '#0F2038' }}>Total</span><span style={{ color: '#0F2038' }}>${total.toLocaleString('es-CL')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
