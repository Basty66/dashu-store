import { Link } from 'react-router-dom'
import { TrendingUp, Package, Truck, Clock, AlertTriangle, ArrowRight, GraduationCap, Store } from 'lucide-react'
import { formatCLP } from '@shared/pricing.js'
import { formatSeminarDate } from '@shared/seminars.js'
import { useAdminData } from '../../hooks/useAdminData'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

function Stat({ icon: Icon, label, value, hint, to }) {
  const body = (
    <Card className="h-full transition-shadow duration-200 hover:shadow-card">
      <div className="flex items-center justify-between text-muted">
        <span className="eyebrow">{label}</span>
        <Icon size={17} aria-hidden="true" />
      </div>
      <p className="mt-4 font-display text-3xl font-bold tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

function SalesChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.total))
  return (
    <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Ventas de los últimos 14 días">
      {days.map((d) => (
        <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
          <div className="rounded-t-md bg-ink transition-colors duration-200 group-hover:bg-gold" style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
          <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs text-paper group-hover:block">
            {new Date(`${d.date}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}: {formatCLP(d.total)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data, error, loading, reload } = useAdminData('/admin/stats')

  return (
    <AdminPage title="Resumen" description="Cómo va la tienda.">
      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={TrendingUp} label="Ventas 30 días" value={formatCLP(data.revenue30d)} hint={`Total histórico ${formatCLP(data.revenue)}`} />
            <Stat icon={Package} label="Unidades vendidas" value={data.unitsSold} hint={`${data.paidOrders} ${data.paidOrders === 1 ? 'pedido pagado' : 'pedidos pagados'}`} />
            <Stat icon={Truck} label="Por despachar" value={data.toShip} hint="Pagados o en preparación" to="/admin/pedidos?estado=PAGADO" />
            <Stat icon={Clock} label="Esperando pago" value={data.awaitingPayment} hint="Stock reservado" to="/admin/pedidos?estado=PENDIENTE_PAGO" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Ventas últimos 14 días</h2>
                <span className="font-mono text-xs text-muted">CLP</span>
              </div>
              <SalesChart days={data.days} />
            </Card>
            <Card>
              <h2 className="font-display text-lg font-bold">Stock</h2>
              {data.lowStock.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Todo el catálogo tiene stock suficiente (40+ unidades).</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2"><AlertTriangle size={15} className="text-warning" aria-hidden="true" />{p.title}</span>
                      <span className={`font-mono tabular ${p.stock <= 0 ? 'text-danger' : 'text-warning'}`}>{p.stock} u.</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/productos" className="mt-6 inline-flex items-center gap-1 text-sm font-medium hover:text-gold-deep">Ajustar stock <ArrowRight size={14} /></Link>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Próximas capacitaciones</h2>
                <Link to="/admin/capacitaciones" className="inline-flex items-center gap-1 text-sm font-medium hover:text-gold-deep">Ver todas <ArrowRight size={14} /></Link>
              </div>
              {data.upcoming.length === 0 ? (
                <p className="text-sm text-muted">No hay capacitaciones próximas.</p>
              ) : (
                <ul className="divide-y divide-sand">
                  {data.upcoming.map((s) => (
                    <li key={s.id}>
                      <Link to={`/admin/capacitaciones/${s.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-gold-deep">
                        <span className="flex items-center gap-3">
                          <GraduationCap size={16} className="text-gold-deep" aria-hidden="true" />
                          <span><span className="font-medium">{s.title}</span> · {s.city}<span className="block text-xs text-muted ">{formatSeminarDate(s.date)}</span></span>
                        </span>
                        <span className="text-right font-mono text-xs tabular">
                          {s.price === null ? `${s.preRegistered} pre-inscritos` : `${s.seatsTaken}/${s.capacity} cupos`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Stat icon={Store} label="Distribuidores" value={data.newLeads} hint={data.newLeads === 1 ? 'postulación nueva' : 'postulaciones nuevas'} to="/admin/distribuidores" />
          </div>
        </div>
      )}
    </AdminPage>
  )
}
