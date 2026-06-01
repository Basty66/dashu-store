import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import OrderTimeline from '../components/OrderTimeline'
import { api } from '../services/api'

export default function OrderTracking() {
  const { orderNumber } = useParams()
  const [search, setSearch] = useState(orderNumber || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async (num) => {
    if (!num) return
    setLoading(true)
    setError('')
    try {
      const data = await api.orders.get(num)
      setOrder(data)
    } catch (err) {
      setError('Orden no encontrada. Verifica el número.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderNumber) fetchOrder(orderNumber)
  }, [orderNumber])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrder(search.trim().toUpperCase())
  }

  const statusLabels = {
    pending: 'Pendiente de pago',
    paid: 'Pago confirmado',
    preparing: 'En preparación',
    dispatched: 'Despachado',
    transit: 'En camino',
    delivered: 'Entregado',
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-navy mb-8 text-center">Seguimiento de Pedido</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-12 max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="#DSH-00000"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm text-center font-medium"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">search_off</span>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {order && (
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-semibold text-xl text-navy">
                  Pedido {order.order_number}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(order.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                'bg-navy/10 text-navy'
              }`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <OrderTimeline status={order.status} trackingNumber={order.tracking_number} />

            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-display font-semibold text-sm text-gray-400 mb-2">Datos de Envío</h3>
                <p className="text-sm text-navy font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-500">{order.customer_email}</p>
                <p className="text-sm text-gray-500">{order.shipping_address}</p>
                <p className="text-sm text-gray-500">{order.shipping_city}, {order.shipping_region}</p>
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-gray-400 mb-2">Productos</h3>
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span className="text-navy">{item.product_name || item.product_id} x{item.quantity}</span>
                    <span className="text-gray-500">${(item.unit_price * item.quantity).toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold text-navy mt-2 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${order.total.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
