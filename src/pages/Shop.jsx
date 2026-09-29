import { PackageSearch } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState, EmptyState } from '../components/molecules/Feedback'
import { ProductCard } from '../components/organisms/ProductCard'
import { PageShell } from '../components/templates/PageShell'

export default function Shop() {
  const { data: products, loading, error, retry } = useProducts()
  return (
    <PageShell eyebrow="Tienda" title="Productos DASHU" description="Compra por unidad o en packs de 5, 10, 20 y 40 con precio por volumen." width="max-w-7xl">
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/5] rounded-4xl" />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : products.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No hay productos disponibles por ahora" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </PageShell>
  )
}
