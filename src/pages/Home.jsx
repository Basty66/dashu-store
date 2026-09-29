import { ArrowRight, PackageSearch } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/atoms/Button'
import { Skeleton } from '../components/atoms/Misc'
import { ErrorState, EmptyState } from '../components/molecules/Feedback'
import { SectionHeading } from '../components/molecules/SectionHeading'
import { Hero, Marquee } from '../components/organisms/Hero'
import { ProductShowcase } from '../components/organisms/ProductShowcase'
import { VolumePricing } from '../components/organisms/VolumePricing'
import { Bento } from '../components/organisms/Bento'
import { BeforeAfter } from '../components/organisms/BeforeAfter'
import { HowToUse } from '../components/organisms/HowToUse'
import { ResellerCalculator } from '../components/organisms/ResellerCalculator'
import { Reviews } from '../components/organisms/Reviews'
import { Faq } from '../components/organisms/Faq'
import { ProductCard } from '../components/organisms/ProductCard'

function ShowcaseSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-4xl" />
      <div className="space-y-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-3 gap-3 pt-6">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}</div>
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  )
}

export default function Home() {
  const { data: products, loading, error, retry } = useProducts()
  const product = products?.[0]
  const others = products?.slice(1) || []
  useSeo({})

  return (
    <>
      <Hero product={product} />
      <Marquee />

      <section id="comprar" className="py-16 lg:py-24">
        <div className="container-x">
          {loading ? (
            <ShowcaseSkeleton />
          ) : error ? (
            <ErrorState message={error.message} onRetry={retry} />
          ) : !product ? (
            <EmptyState icon={PackageSearch} title="Estamos reponiendo stock" message="Vuelve pronto o escríbenos para reservar tu pedido." />
          ) : (
            <ProductShowcase product={product} />
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="pb-20">
          <div className="container-x">
            <SectionHeading eyebrow="Catálogo" title="Más productos DASHU" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {product && <VolumePricing product={product} />}
      <Bento product={product} />
      <BeforeAfter />
      <HowToUse />
      {product && <ResellerCalculator product={product} />}
      <Reviews />
      <Faq />

      <section className="grain relative overflow-hidden bg-navy py-20 text-paper lg:py-28">
        <div className="container-x flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="display-xl max-w-3xl">
            Tu pelo, <span className="font-serif font-normal italic text-gold" style={{ fontStretch: '100%' }}>bajo control.</span>
          </h2>
          <Button variant="gold" size="lg" href="#comprar">
            Elegir mi pack <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </section>
    </>
  )
}
