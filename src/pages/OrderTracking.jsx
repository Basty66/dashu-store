import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Search } from 'lucide-react'
import { clp } from '../lib/format'

const STATUSES = ['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado']
const STATUS_LABELS = ['Pendiente', 'Confirmado', 'En Preparación', 'En Tránsito', 'Entregado']

function getTimelineData(statusIdx) {
  return STATUSES.map((s, i) => ({
    label: STATUS_LABELS[i],
    completed: i <= statusIdx,
    active: i === statusIdx,
  }))
}

export default function OrderTracking() {
  const { clearCart } = useCart()
  const { orderNumber: paramOrderNumber } = useParams()
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const success = searchParams.get('success') === 'true'

  useEffect(() => {
    if (success) clearCart()
  }, [success, clearCart])

  const search = useCallback(async (number) => {
    const n = number || orderNumber
    if (!n.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const r = await fetch(`/api/orders/${n.trim()}`)
      if (!r.ok) throw new Error('Not found')
      setOrder(await r.json())
    } catch {
      setError('No encontramos un pedido con ese número. Verifica e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [orderNumber])

  useEffect(() => {
    if (paramOrderNumber) {
      setOrderNumber(paramOrderNumber)
    }
  }, [paramOrderNumber])

  useEffect(() => {
    if (paramOrderNumber) {
      search(paramOrderNumber)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramOrderNumber])

  const statusIdx = order ? STATUSES.indexOf(order.status) : -1
  const timeline = statusIdx >= 0 ? getTimelineData(statusIdx) : []

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
              <p className="text-green-700 font-medium text-lg">¡Pago exitoso!</p>
              <p className="text-green-600 text-sm mt-1">Recibirás un correo con los detalles de tu pedido.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="text-center mb-10">
          <span className="label text-xs text-gold">Seguimiento</span>
          <h1 className="h-lg text-3xl text-navy mt-2">Rastrea tu Pedido</h1>
        </div>

        <div className="max-w-md mx-auto mb-16">
          <div className="relative flex items-center">
            <input className="input-minimal w-full pr-12" placeholder="N° de pedido (ej. DASHU-XXX)"
              value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()} />
            <motion.button className="absolute right-2 p-3" onClick={search} disabled={loading}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Search size={18} strokeWidth={1.5} className="text-navy" />
            </motion.button>
          </div>
          {error && <p className="text-xs mt-2 text-red-700">{error}</p>}
        </div>

        <AnimatePresence mode="wait">
          {order && (
            <motion.div key={order.orderNumber} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-12">
              <div className="glass p-6 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs text-stone">Pedido</p>
                  <p className="h-md text-navy">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone">Estado Actual</p>
                  <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: order.status === 'Entregado' ? 'rgba(117,88,65,0.15)' : 'rgba(15,32,56,0.08)',
                      color: order.status === 'Entregado' ? '#755841' : '#0F2038',
                    }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {timeline.length > 0 && (
                <div>
                  <h2 className="h-md text-navy mb-8 text-center">Estado del Pedido</h2>
                  <div className="relative w-full max-w-xl mx-auto">
                    <div className="absolute left-8 top-6 bottom-6 w-[2px] bg-outline-v/30">
                      <motion.div initial={{ height: '0%' }}
                        animate={{ height: `${((statusIdx + 1) / STATUSES.length) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="w-full bg-gold" />
                    </div>
                    {timeline.map((t, i) => (
                      <div key={t.label} className="flex items-start gap-6 pb-8 last:pb-0">
                        <div className="relative z-10 flex-shrink-0">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              t.completed ? 'bg-gold border-gold' : 'bg-cream border-outline-v/40'
                            }`}>
                            {t.completed && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </motion.div>
                        </div>
                        <div className="pt-1">
                          <p className={`h-sm text-sm ${t.completed ? 'text-navy' : 'text-stone'}`}>{t.label}</p>
                          {t.active && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-xs mt-1 text-gold">En proceso</motion.p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded space-y-3">
                  <h3 className="h-sm text-navy">Productos</h3>
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone">{item.title} × {item.quantity}</span>
                      <span className="text-navy text-sm">{clp(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-outline-v/20 pt-3 flex justify-between font-medium">
                    <span className="text-navy">Total</span>
                    <span className="text-navy">{clp(order.total)}</span>
                  </div>
                </div>
                <div className="glass p-6 rounded space-y-3">
                  <h3 className="h-sm text-navy">Envío</h3>
                  <p className="text-sm text-stone">{order.customerName}</p>
                  <p className="text-sm text-stone">{order.shippingAddress}, {order.shippingCity}, {order.shippingRegion}</p>
                  <p className="text-sm text-stone">{order.customerEmail} · {order.customerPhone}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
