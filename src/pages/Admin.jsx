import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/admin/orders')
        setOrders(await r.json())
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    } catch {}
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const stats = [
    { label: 'Total Pedidos', value: orders.length, color: '#0F2038' },
    { label: 'Pendientes', value: orders.filter(o => o.status === 'Pendiente').length, color: '#755841' },
    { label: 'En tránsito', value: orders.filter(o => o.status === 'En tránsito').length, color: '#755841' },
    { label: 'Entregados', value: orders.filter(o => o.status === 'Entregado').length, color: '#755841' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: '#fff8f5' }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="text-center mb-10">
          <span className="label text-xs" style={{ color: '#755841' }}>Admin</span>
          <h1 className="h-lg text-3xl mt-2" style={{ color: '#0F2038' }}>Dashboard</h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass p-5 rounded text-center">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="display-sm" style={{ color: s.color }}>
                {String(s.value).padStart(2, '0')}
              </motion.p>
              <p className="text-xs mt-1" style={{ color: '#44474d' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                filter === s ? 'bg-navy text-white' : 'text-stone hover:text-navy'
              }`}>
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="glass rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-v/20">
                  {['Pedido', 'Cliente', 'Total', 'Estado', 'Fecha', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#44474d' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-stone">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-stone">Sin pedidos</td></tr>
                ) : (
                  filtered.map(o => (
                    <tr key={o.id || o.orderNumber} className="border-b border-outline-v/10 hover:bg-white/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(o)}>
                      <td className="px-4 py-3 font-medium" style={{ color: '#0F2038' }}>{o.orderNumber}</td>
                      <td className="px-4 py-3" style={{ color: '#44474d' }}>{o.shipping?.name || '—'}</td>
                      <td className="px-4 py-3" style={{ color: '#0F2038' }}>${(o.total || 0).toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full"
                          style={{ backgroundColor: 'rgba(15,32,56,0.08)', color: '#0F2038' }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#75777e' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                          className="text-xs border border-outline-v/30 rounded px-2 py-1 bg-white/50"
                          style={{ color: '#0F2038' }}>
                          {['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs" style={{ color: '#44474d' }}>Pedido</p>
                  <p className="h-md text-navy">{selected.orderNumber}</p>
                </div>
                <motion.button onClick={() => setSelected(null)} className="p-1" whileHover={{ rotate: 90 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44474d" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="glass p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Cliente</h4>
                  <p className="text-sm" style={{ color: '#44474d' }}>{selected.shipping?.name}</p>
                  <p className="text-sm" style={{ color: '#44474d' }}>{selected.shipping?.email} · {selected.shipping?.phone}</p>
                  <p className="text-sm" style={{ color: '#44474d' }}>{selected.shipping?.address}, {selected.shipping?.city}, {selected.shipping?.region}</p>
                </div>

                <div className="glass p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Productos</h4>
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span style={{ color: '#44474d' }}>{item.title} × {item.quantity}</span>
                      <span style={{ color: '#0F2038' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                  <div className="border-t border-outline-v/20 mt-2 pt-2 flex justify-between font-medium">
                    <span style={{ color: '#0F2038' }}>Total</span>
                    <span style={{ color: '#0F2038' }}>${(selected.total || 0).toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <div className="glass p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Estado</h4>
                  <select value={selected.status} onChange={e => { updateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }) }}
                    className="input-minimal w-full">
                    {['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
