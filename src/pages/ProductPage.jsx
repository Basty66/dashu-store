import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatCLP, lowestUnitPrice } from '@shared/pricing.js'
import { useProduct } from '../hooks/useProducts'
import { useSeo } from '../hooks/useSeo'
import { Skeleton } from '../components/atoms/Misc'
import { Button } from '../components/atoms/Button'
import { ErrorState } from '../components/molecules/Feedback'
import { ProductShowcase } from '../components/organisms/ProductShowcase'
import { VolumePricing } from '../components/organisms/VolumePricing'
import { BeforeAfter } from '../components/organisms/BeforeAfter'
import { HowToUse } from '../components/organisms/HowToUse'
import { Reviews } from '../components/organisms/Reviews'

// Datos estructurados para Google (precio, stock, marca).
function useProductJsonLd(product) {
  useEffect(() => {
    if (!product) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      brand: { '@type': 'Brand', name: product.brand },
      image: product.images.map((src) => new URL(src, window.location.origin).href),
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CLP',
        lowPrice: Math.min(...product.packs.map((p) => p.price)),
        highPrice: Math.max(...product.packs.map((p) => p.price)),
        offerCount: product.packs.length,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [product])
}

export default function ProductPage() {
  const { slug } = useParams()
  const { data: product, loading, error, retry } = useProduct(slug)
  useSeo({
    title: product?.title,
    description: product ? `${product.subtitle || product.title}. Desde ${formatCLP(lowestUnitPrice(product.packs))} c/u en packs.` : undefined,
  })
  useProductJsonLd(product)

  if (loading) {
    return (
      <div className="container-x grid gap-10 py-14 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-4xl" />
        <div className="space-y-4"><Skeleton className="h-14 w-3/4" /><Skeleton className="h-64 w-full" /></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="container-x py-20">
        {error.status === 404 ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="display-md">No encontramos este producto</p>
            <Button to="/tienda">Ver la tienda</Button>
          </div>
        ) : (
          <ErrorState message={error.message} onRetry={retry} />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="container-x py-10 lg:py-14">
        <nav aria-label="Migas de pan" className="mb-8 flex items-center gap-1.5 text-sm text-muted">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/tienda" className="hover:text-ink">Tienda</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="text-ink" aria-current="page">{product.title}</span>
        </nav>
        <ProductShowcase product={product} headingLevel="h1" />
      </div>
      <VolumePricing product={product} />
      <BeforeAfter />
      <HowToUse />
      <Reviews />
    </>
  )
}
