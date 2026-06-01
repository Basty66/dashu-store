import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUSES = ['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado']
const STATUS_LABELS = ['Pendiente', 'Confirmado', 'En Preparación', 'En Tránsito', 'Entregado']

function getTimelineData(statusIdx) {
  return STATUSES.map((s, i) => ({
    label: STATUS_LABELS[i],
    completed: i <= statusIdx,
    active: i === statusIdx,
    isLast: i === STATUSES.length - 1,
  }))
}

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!orderNumber.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const r = await fetch(`/api/orders/${orderNumber.trim()}`)
      if (!r.ok) throw new Error('Pedido no encontrado')
      setOrder(await r.json())
    } catch {
      setError('No encontramos un pedido con ese número. Verifica e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: '#fff8f5' }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="text-center mb-10">
          <span className="label text-xs" style={{ color: '#755841' }}>Seguimiento</span>
          <h1 className="h-lg text-3xl mt-2" style={{ color: '#0F2038' }}>Rastrea tu Pedido</h1>
        </div>

        {/* SEARCH */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative flex items-center">
            <input className="input-minimal w-full pr-12" placeholder="N° de pedido (ej. DASHU-001)" value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <motion.button className="absolute right-2 p-2" onClick={search} disabled={loading}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2038" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </motion.button>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>

        <AnimatePresence mode="wait">
          {order && (
            <motion.div key={order.orderNumber} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-12">

              {/* HEADER */}
              <div className="glass p-6 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs" style={{ color: '#44474d' }}>Pedido</p>
                  <p className="h-md text-navy">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#44474d' }}>Estado Actual</p>
                  <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: order.status === 'Entregado' ? 'rgba(117,88,65,0.15)' : 'rgba(15,32,56,0.08)', color: order.status === 'Entregado' ? '#755841' : '#0F2038' }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* TIMELINE */}
              <div>
                <h2 className="h-md text-navy mb-8 text-center">Estado del Pedido</h2>
                <div className="relative flex flex-col items-center">
                  {(() => {
                    const statusIdx = STATUSES.indexOf(order.status)
                    const timeline = statusIdx >= 0 ? getTimelineData(statusIdx) : []
                    return (
                      <div className="relative w-full max-w-xl">
                        {/* line */}
                        <div className="absolute left-8 top-6 bottom-6 w-[2px] bg-outline-v/30">
                          <motion.div initial={{ height: '0%' }} animate={{ height: `${((statusIdx + 1) / STATUSES.length) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="w-full bg-gold" />
                        </div>
                        {timeline.map((t, i) => (
                          <div key={t.label} className="flex items-start gap-6 pb-8 last:pb-0">
                            <div className="relative z-10 flex-shrink-0">
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${t.active ? 'bg-gold border-gold' : t.completed ? 'bg-gold border-gold' : 'bg-cream border-outline-v/40'}`}>
                                {t.completed && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </motion.div>
                            </div>
                            <div className="pt-1">
                              <p className={`h-sm text-sm ${t.active ? 'text-navy' : t.completed ? 'text-navy' : 'text-stone'}`}>{t.label}</p>
                              {t.active && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                  className="text-xs mt-1" style={{ color: '#755841' }}>
                                  En proceso
                                </motion.p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded space-y-3">
                  <h3 className="h-sm text-navy">Productos</h3>
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span style={{ color: '#44474d' }}>{item.title} × {item.quantity}</span>
                      <span style={{ color: '#0F2038' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
                <div className="glass p-6 rounded space-y-3">
                  <h3 className="h-sm text-navy">Envío</h3>
                  <p className="text-sm" style={{ color: '#44474d' }}>{order.shipping?.name}</p>
                  <p className="text-sm" style={{ color: '#44474d' }}>{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.region}</p>
                  <p className="text-sm" style={{ color: '#44474d' }}>{order.shipping?.email} · {order.shipping?.phone}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
