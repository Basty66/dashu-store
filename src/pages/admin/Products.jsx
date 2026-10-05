import { Link } from 'react-router-dom'
import { Plus, Package } from 'lucide-react'
import { formatCLP, packLabel, packUnitPrice, sortPacks } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { Button } from '../../components/atoms/Button'
import { Badge } from '../../components/atoms/Badge'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState, EmptyState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

export default function Products() {
  const { data: products, error, loading, reload } = useAdminData('/admin/products')

  return (
    <AdminPage title="Productos" description="Precios por formato, stock e imágenes." actions={<Button to="/admin/productos/nuevo"><Plus size={16} /> Nuevo producto</Button>}>
      {loading && !products ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : products.length === 0 ? (
        <Card><EmptyState icon={Package} title="Aún no hay productos" action={<Button to="/admin/productos/nuevo">Crear el primero</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <Link key={p.id} to={`/admin/productos/${p.id}`} className="block">
              <Card className="flex flex-col gap-5 transition-shadow duration-200 hover:shadow-card sm:flex-row sm:items-center">
                <div className="h-20 w-20 flex-none overflow-hidden rounded-2xl bg-navy">
                  {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-bold">{p.title}</p>
                    {!p.isActive && <Badge tone="warning">Oculto</Badge>}
                    {p.packs.some((pack) => pack.onSale) && <Badge tone="sale">Oferta activa</Badge>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sortPacks(p.packs).map((pack) => (
                      <span key={pack.units} className={`rounded-full border px-3 py-1 font-mono text-xs ${pack.isActive ? 'border-sand-300' : 'border-dashed border-sand-300 text-muted line-through'}`}>
                        {packLabel(pack.units)} · {formatCLP(pack.price)}{pack.units > 1 ? ` (${formatCLP(packUnitPrice(pack))} c/u)` : ''}
                        {pack.onSale && <span className="ml-1 text-danger">→ {formatCLP(pack.salePrice)}</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-display text-2xl font-bold tabular ${p.stock <= 0 ? 'text-danger' : p.stock < 40 ? 'text-warning' : ''}`}>{p.stock}</p>
                  <p className="text-xs text-muted">unidades</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AdminPage>
  )
}
