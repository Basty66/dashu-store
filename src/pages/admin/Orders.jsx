import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ShoppingCart } from 'lucide-react'
import { ORDER_STATUS } from '@shared/orderStatus.js'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { Input } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState, EmptyState, StatusBadge } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const tabs = ['all', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'PENDIENTE_PAGO', 'ENTREGADO', 'CANCELADO', 'EXPIRADO']

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const status = params.get('estado') || 'all'
  const [q, setQ] = useState(params.get('q') || '')
  const [debounced, setDebounced] = useState(q)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const query = new URLSearchParams({ status, ...(debounced ? { q: debounced } : {}) }).toString()
  const { data: orders, error, loading, reload } = useAdminData(`/admin/orders?${query}`)

  return (
    <AdminPage title="Pedidos" description="Gestiona pagos, preparación y despachos.">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParams(t === 'all' ? {} : { estado: t })}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${status === t ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'}`}
            >
              {t === 'all' ? 'Todos' : ORDER_STATUS[t].label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, nombre o email" className="h-11 pl-10" aria-label="Buscar pedidos" />
        </div>
      </div>

      <Card className="overflow-hidden p-0 sm:p-0">
        {loading && !orders ? (
          <div className="space-y-2 p-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={reload} className="border-0" />
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No hay pedidos en esta vista" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-sand text-left font-mono text-2xs uppercase tracking-[0.12em] text-muted">
                  <th className="px-6 py-3 font-medium">Pedido</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 text-right font-medium">Unidades</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-sand/70 transition-colors last:border-0 hover:bg-white">
                    <td className="px-6 py-3.5">
                      <Link to={`/admin/pedidos/${o.id}`} className="font-mono font-medium underline-offset-4 hover:underline">{o.orderNumber}</Link>
                      {o.documentType === 'factura' && <span className="ml-2 rounded bg-navy/10 px-1.5 py-0.5 text-2xs text-navy">Factura</span>}
                    </td>
                    <td className="px-3 py-3.5"><span className="block">{o.customerName}</span><span className="block text-xs text-muted">{o.shippingCommune}, {o.shippingRegion}</span></td>
                    <td className="px-3 py-3.5 text-muted">{new Date(o.createdAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-3 py-3.5 text-right font-mono tabular">{o.items.reduce((n, i) => n + i.packUnits * i.quantity, 0)}</td>
                    <td className="px-3 py-3.5 text-right font-mono tabular">{formatCLP(o.total)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminPage>
  )
}
