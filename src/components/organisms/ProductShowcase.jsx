import { STORE } from '@shared/store.js'
import { formatCLP, lowestUnitPrice } from '@shared/pricing.js'
import { scrollToTarget } from '../../lib/smoothScroll'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { AccordionItem } from '../molecules/Accordion'
import { TrustBadges } from '../molecules/TrustBadges'
import { ProductGallery } from './ProductGallery'
import { BuyBox } from './BuyBox'
import { MobileStickyBar } from './MobileStickyBar'

// Galería + información + caja de compra. Se usa en el inicio y en la ficha del producto.
export function ProductShowcase({ product, headingLevel = 'h2' }) {
  const Title = headingLevel
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-28">
          <ProductGallery images={product.images} title={product.title} />
        </div>
      </div>
      <div className="lg:col-span-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="gold">{product.brand}</Badge>
          <Badge>Origen Corea</Badge>
          {product.contentSize && <Badge>{product.contentSize}</Badge>}
        </div>
        <Title className="display-lg mt-4">{product.title}</Title>
        {product.subtitle && <p className="mt-3 text-lg text-muted">{product.subtitle}</p>}
        <div className="my-8 h-px bg-sand" />
        <BuyBox product={product} />
        <div className="mt-8 rounded-3xl border border-sand bg-paper p-6">
          <TrustBadges compact />
        </div>
        <div className="mt-6">
          <AccordionItem title="Descripción" defaultOpen>
            <p className="whitespace-pre-line">{product.description}</p>
          </AccordionItem>
          {product.howToUse && (
            <AccordionItem title="Modo de uso">
              <p className="whitespace-pre-line">{product.howToUse}</p>
            </AccordionItem>
          )}
          {product.ingredients && (
            <AccordionItem title="Ingredientes destacados">
              <p className="whitespace-pre-line">{product.ingredients}</p>
            </AccordionItem>
          )}
          <AccordionItem title="Envíos, boleta y factura">
            <p>
              Despachamos a todo Chile por courier con número de seguimiento. El costo se calcula según tu región en el checkout.
              Puedes pedir boleta o factura (con RUT, razón social y giro).
            </p>
          </AccordionItem>
          <AccordionItem title="Sobre DASHU STORE">
            <p>{STORE.legalNotice}</p>
          </AccordionItem>
        </div>
      </div>
    </div>
  )
}

// Barra fija de compra en celular: aparece al pasar la caja de compra y lleva de vuelta al selector.
export function ProductBuyBar({ product }) {
  return (
    <MobileStickyBar targetId="caja-compra" mode="after">
      <div className="h-11 w-11 flex-none overflow-hidden rounded-xl bg-navy">
        {product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{product.brand} {product.title}</p>
        <p className="text-xs text-muted tabular">Desde {formatCLP(lowestUnitPrice(product.packs))} c/u</p>
      </div>
      <Button onClick={() => scrollToTarget(document.getElementById('caja-compra'))} className="flex-none">
        Comprar
      </Button>
    </MobileStickyBar>
  )
}
