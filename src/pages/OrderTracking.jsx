import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import OrderTimeline from '../components/OrderTimeline'
import { api } from '../services/api'
import MagneticButton from '../components/MagneticButton'

const statusLabels = {
  pending: 'Pendiente', paid: 'Pago Confirmado', preparing: 'En Preparación',
  dispatched: 'En Camino', transit: 'En Tránsito', delivered: 'Entregado',
}

export default function OrderTracking() {
  const { orderNumber } = useParams()
  const [search, setSearch] = useState(orderNumber || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async (num) => {
    if (!num) return
    setLoading(true); setError('')
    try { setOrder(await api.orders.get(num)) }
    catch { setError('Orden no encontrada'); setOrder(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (orderNumber) fetchOrder(orderNumber) }, [orderNumber])
  const handleSearch = (e) => { e.preventDefault(); fetchOrder(search.trim().toUpperCase()) }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-cream" style={{ position: 'relative', zIndex: 1 }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-cream animate-orb" style={{ top: '15%', left: '-10%', opacity: 0.3 }} />
        <div className="orb orb-navy animate-orb-reverse" style={{ bottom: '25%', right: '-5%', opacity: 0.15 }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 lg:px-10 relative">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-navy tracking-tight mb-2">Seguimiento</h1>
          <p className="text-sm text-stone">Ingresa tu número de pedido DSH-XXXXX</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-sm mx-auto mb-12">
          <div className="flex-1 floating-input-wrap">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="" className="text-center font-medium tracking-wide" style={{ padding: '12px 16px' }} />
            <label style={{ left: '50%', transform: 'translateX(-50%) translateY(-50%)', textAlign: 'center' }}>#DSH-00000</label>
          </div>
          <MagneticButton type="submit" className="btn-primary px-6 shrink-0" disabled={loading}>
            {loading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round"/></svg>
            ) : 'Buscar'}
          </MagneticButton>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-16">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" className="mx-auto mb-4">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm text-stone mb-3">{error}</p>
              <p className="text-xs text-stone/50">Verifica el número e intenta nuevamente</p>
            </motion.div>
          )}

          {order && (
            <motion.div key="order" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="glass p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-navy">{order.order_number}</h2>
                    <p className="text-xs text-stone mt-1">
                      {new Date(order.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <motion.span key={order.status} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-navy text-white' :
                      order.status === 'dispatched' || order.status === 'transit' ? 'bg-gold text-white' :
                      'bg-white/60 backdrop-blur-sm text-stone border border-navy/5'
                    }`}>{statusLabels[order.status] || order.status}</motion.span>
                </div>
                <OrderTimeline status={order.status} />
              </div>

              <div className="glass p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[11px] font-medium text-stone uppercase tracking-wider mb-3">Envío</h3>
                    <p className="text-sm font-medium text-navy">{order.customer_name}</p>
                    <p className="text-xs text-stone">{order.customer_email}</p>
                    <div className="divider my-3" />
                    <p className="text-xs text-stone leading-relaxed">{order.shipping_address}<br />{order.shipping_city}, {order.shipping_region}</p>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-medium text-stone uppercase tracking-wider mb-3">Productos</h3>
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm mb-2">
                        <span className="text-navy">{item.product_name || `Producto #${item.product_id}`} × {item.quantity}</span>
                        <span className="text-stone">${(item.unit_price * item.quantity).toLocaleString('es-CL')}</span>
                      </div>
                    ))}
                    <div className="divider my-3" />
                    <div className="flex justify-between font-display font-semibold text-base text-navy">
                      <span>Total</span><span>${order.total.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-5 flex items-center gap-4">
                <div className="w-9 h-9 bg-white/40 flex items-center justify-center flex-shrink-0 animate-pulse-glow rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-navy">Despachado por Starken</p>
                  <p className="text-[11px] text-stone mt-0.5">N° seguimiento: <span className="font-medium text-navy">{order.tracking_number || 'Pendiente'}</span></p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/" className="text-xs text-stone hover:text-navy transition-colors underline underline-offset-4">Volver al inicio</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
