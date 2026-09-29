import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { formatCLP, lowestUnitPrice } from '@shared/pricing.js'
import { Badge } from '../atoms/Badge'
import { Img } from '../atoms/Misc'

export function ProductCard({ product }) {
  const soldOut = product.stock <= 0
  return (
    <Link to={`/producto/${product.slug}`} className="group flex flex-col overflow-hidden rounded-4xl border border-sand bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <Img src={product.images[0]} alt={product.title} ratio="4 / 5" className="bg-navy" imgClassName="transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="light">{product.brand}</Badge>
          {soldOut && <Badge tone="danger">Agotado</Badge>}
        </div>
        <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-paper text-ink opacity-0 shadow-card transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-6">
        <h3 className="text-xl font-bold">{product.title}</h3>
        {product.subtitle && <p className="line-clamp-2 text-sm text-muted">{product.subtitle}</p>}
        <p className="mt-auto pt-4 text-sm">
          Desde <span className="font-display text-xl font-bold tabular">{formatCLP(lowestUnitPrice(product.packs))}</span> <span className="text-muted">c/u en pack</span>
        </p>
      </div>
    </Link>
  )
}
