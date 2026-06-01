import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import OrderTimeline from '../components/OrderTimeline'
import { api } from '../services/api'

const statusLabels = {
  pending: 'Pendiente', paid: 'Pago Confirmado', preparing: 'En Preparación',
  dispatched: 'Despachado', transit: 'En Camino', delivered: 'Entregado',
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
    try {
      setOrder(await api.orders.get(num))
    } catch {
      setError('Orden no encontrada'); setOrder(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { if (orderNumber) fetchOrder(orderNumber) }, [orderNumber])

  const handleSearch = (e) => { e.preventDefault(); fetchOrder(search.trim().toUpperCase()) }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal tracking-tight mb-3">Seguimiento</h1>
          <p className="font-body text-slate text-sm">Ingresa tu número de pedido para ver su estado</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-sm mx-auto mb-14">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="#DSH-00000"
            className="input-premium text-center font-medium tracking-wide"
          />
          <button type="submit" className="btn-primary px-6 text-sm" disabled={loading}>
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="text-center py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className="text-sm text-slate">{error}</p>
          </div>
        )}

        {order && (
          <div>
            <div className="card-premium p-8 mb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="font-display font-semibold text-xl text-charcoal">
                    {order.order_number}
                  </h2>
                  <p className="text-sm text-slate mt-1">
                    {new Date(order.created_at).toLocaleDateString('es-CL', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide ${
                  order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                  order.status === 'dispatched' || order.status === 'transit' ? 'bg-blue-50 text-blue-700' :
                  'bg-charcoal/5 text-charcoal/70'
                }`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <OrderTimeline status={order.status} trackingNumber={order.tracking_number} />
            </div>

            <div className="card-premium p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-medium text-slate uppercase tracking-wider mb-3">Envío</h3>
                  <p className="text-sm font-medium text-charcoal">{order.customer_name}</p>
                  <p className="text-sm text-slate">{order.customer_email}</p>
                  <p className="text-sm text-slate mt-2">{order.shipping_address}<br />{order.shipping_city}, {order.shipping_region}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate uppercase tracking-wider mb-3">Productos</h3>
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-2">
                      <span className="text-charcoal">{item.product_name || item.product_id} × {item.quantity}</span>
                      <span className="text-slate">${(item.unit_price * item.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold text-charcoal mt-4 pt-4 border-t border-black/5">
                    <span>Total</span>
                    <span>${order.total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
