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
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-10 bg-parchment">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-soot tracking-tight mb-3">Seguimiento</h1>
          <p className="text-sm text-stone">Ingresa tu número de pedido para ver su estado</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-sm mx-auto mb-16">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="#DSH-00000" className="input text-center font-medium tracking-wide"
          />
          <button type="submit" className="btn-primary px-6" disabled={loading}>
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round"/></svg>
            ) : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="text-center py-16">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" className="mx-auto mb-4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className="text-sm text-stone">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-enter">
            <div className="card p-8 lg:p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-display font-semibold text-xl text-soot">{order.order_number}</h2>
                    <span className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-soot text-parchment' :
                      order.status === 'dispatched' || order.status === 'transit' ? 'bg-clay text-parchment' :
                      'bg-linen text-stone'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone">
                    {new Date(order.created_at).toLocaleDateString('es-CL', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <OrderTimeline status={order.status} trackingNumber={order.tracking_number} />
            </div>

            <div className="card p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-medium text-stone uppercase tracking-wider mb-3">Envío</h3>
                  <p className="text-sm font-medium text-soot">{order.customer_name}</p>
                  <p className="text-sm text-stone">{order.customer_email}</p>
                  <p className="text-sm text-stone mt-3">{order.shipping_address}<br />{order.shipping_city}, {order.shipping_region}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-stone uppercase tracking-wider mb-3">Productos</h3>
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-2">
                      <span className="text-soot">{item.product_name || item.product_id} × {item.quantity}</span>
                      <span className="text-stone">${(item.unit_price * item.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                  <div className="divider my-4" />
                  <div className="flex justify-between font-display font-semibold text-base text-soot">
                    <span>Total</span><span>${order.total.toLocaleString('es-CL')}</span>
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
