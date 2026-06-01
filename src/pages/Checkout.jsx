import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import { REGIONS, getCommunes } from '../services/chile'
import MagneticButton from '../components/MagneticButton'

const tabs = [
  { id: 'webpay', label: 'Webpay Plus', desc: 'Débito · Crédito · Redcompra' },
  { id: 'mercadopago', label: 'Mercado Pago', desc: 'Tarjeta · Efectivo · Transferencia' },
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('webpay')
  const [form, setForm] = useState({ name: '', email: '', phone: '', region: '', commune: '', address: '' })
  const [communes, setCommunes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setCommunes(getCommunes(form.region)); setForm(f => ({ ...f, commune: '' })) }, [form.region])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const order = await api.orders.create({
        ...form, paymentMethod,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, unit_price: i.price })),
        total: subtotal,
      })
      if (paymentMethod === 'webpay') {
        const wp = await api.payments.webpayCreate({
          orderNumber: order.order_number, amount: subtotal, sessionId: Date.now().toString(),
        })
        const f = document.createElement('form'); f.method = 'POST'; f.action = wp.url
        const inp = document.createElement('input'); inp.type = 'hidden'; inp.name = 'token_ws'; inp.value = wp.token
        f.appendChild(inp); document.body.appendChild(f); f.submit()
      } else {
        const mp = await api.payments.mercadopagoCreate({ orderNumber: order.order_number, amount: subtotal })
        if (mp.redirect_url) window.location.href = mp.redirect_url
        else navigate(`/order/${order.order_number}`)
      }
      clearCart()
    } catch (err) { setError(err.message || 'Error al procesar') } finally { setLoading(false) }
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
        <div className="text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B8580" strokeWidth="1" className="mx-auto mb-4">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p className="text-sm text-stone mb-6">Tu carrito está vacío</p>
          <MagneticButton onClick={() => navigate('/')} className="btn-primary">Volver a Comprar</MagneticButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-cream" style={{ position: 'relative', zIndex: 1 }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-cream animate-orb" style={{ top: '10%', right: '-15%', opacity: 0.3 }} />
        <div className="orb orb-gold animate-orb-reverse" style={{ bottom: '20%', left: '-10%', opacity: 0.2 }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 relative">
        <div className="flex items-center gap-3 mb-10">
          <motion.button onClick={() => navigate('/')} className="p-1" whileHover={{ x: -3 }} transition={{ type: 'spring', damping: 15 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </motion.button>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-navy tracking-tight">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            {/* Shipping */}
            <div className="glass p-6 lg:p-8 space-y-5">
              <h2 className="font-semibold text-xs tracking-wider uppercase text-navy/70">Datos de Envío</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 floating-input-wrap">
                  <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="" />
                  <label>Nombre Completo</label>
                </div>
                <div className="floating-input-wrap">
                  <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="" />
                  <label>Email</label>
                </div>
                <div className="floating-input-wrap">
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="" />
                  <label>Teléfono</label>
                </div>
                <div className="floating-input-wrap">
                  <select name="region" required value={form.region} onChange={handleChange}>
                    <option value=""></option>
                    {REGIONS.map(r => <option key={r.name}>{r.name}</option>)}
                  </select>
                  <label>Región</label>
                </div>
                <div className="floating-input-wrap">
                  <select name="commune" required value={form.commune} onChange={handleChange} disabled={!communes.length}>
                    <option value=""></option>
                    {communes.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <label>Comuna</label>
                </div>
                <div className="col-span-2 floating-input-wrap">
                  <input type="text" name="address" required value={form.address} onChange={handleChange} placeholder="" />
                  <label>Dirección</label>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="glass p-6 lg:p-8">
              <h2 className="font-semibold text-xs tracking-wider uppercase text-navy/70 mb-5">Método de Pago</h2>
              {/* Sliding capsule toggle */}
              <div className="capsule-track max-w-sm">
                <div
                  className="capsule-indicator"
                  style={{
                    left: paymentMethod === 'webpay' ? '4px' : '50%',
                    width: paymentMethod === 'webpay' ? 'calc(50% - 6px)' : 'calc(50% - 6px)',
                  }}
                />
                {tabs.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => setPaymentMethod(t.id)}
                    className={`capsule-option ${paymentMethod === t.id ? 'active' : ''}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone mt-3 ml-1">
                {tabs.find(t => t.id === paymentMethod)?.desc}
              </p>
              <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-navy/[0.03]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B8580" strokeWidth="1.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <p className="text-[11px] text-stone">Transacción 100% segura</p>
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-2">
            <div className="glass p-6 lg:p-8 sticky top-24">
              <h2 className="font-semibold text-xs tracking-wider uppercase text-navy/70 mb-5">Resumen</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cream flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                      <p className="text-[11px] text-stone">Cant: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                  </div>
                ))}
              </div>
              <div className="divider mb-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-stone">Subtotal</span><span className="font-medium text-navy">${subtotal.toLocaleString('es-CL')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-stone">Envío</span><span className="text-stone">{subtotal >= 50000 ? 'Gratis' : 'Calculando...'}</span></div>
                <div className="divider my-3" />
                <div className="flex justify-between font-display font-bold text-xl text-navy"><span>Total</span><span>${subtotal.toLocaleString('es-CL')}</span></div>
              </div>
              {error && <p className="text-xs mt-3" style={{ color: '#c0392b' }}>{error}</p>}
              <motion.button type="submit" disabled={loading || items.length === 0}
                className="btn-primary w-full justify-center mt-5 disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.99 } : {}}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round"/></svg>
                    Procesando...
                  </span>
                ) : (
                  <><span>Pagar ${subtotal.toLocaleString('es-CL')}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
