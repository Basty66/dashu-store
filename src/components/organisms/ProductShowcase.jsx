import { STORE } from '@shared/store.js'
import { Badge } from '../atoms/Badge'
import { AccordionItem } from '../molecules/Accordion'
import { TrustBadges } from '../molecules/TrustBadges'
import { ProductGallery } from './ProductGallery'
import { BuyBox } from './BuyBox'

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
