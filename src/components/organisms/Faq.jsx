import { Link } from 'react-router-dom'
import { STORE, DISTRIBUTOR, DISTRIBUTOR_MIN_UNITS, DISTRIBUTOR_MIN_TOTAL, PAYMENT_WINDOW_MINUTES } from '@shared/store.js'
import { FREE_SHIPPING_FROM } from '@shared/shipping.js'
import { formatCLP } from '@shared/pricing.js'
import { AccordionItem } from '../molecules/Accordion'
import { SectionHeading } from '../molecules/SectionHeading'

const faqs = [
  {
    q: '¿Cómo funcionan los packs?',
    a: 'Puedes comprar por unidad o en packs de 3 y 10 cremas. Mientras más grande el pack, menor es el precio por unidad. Puedes combinar distintos packs en el mismo carrito.',
  },
  {
    q: '¿Cuánto cuesta el envío?',
    a: `El costo depende de tu región y lo ves antes de pagar.${FREE_SHIPPING_FROM !== null ? ` Los pedidos desde ${formatCLP(FREE_SHIPPING_FROM)} tienen envío gratis.` : ''} Despachamos por courier y te enviamos el número de seguimiento.`,
  },
  {
    q: '¿Cómo sigo mi pedido?',
    a: (
      <>
        Te mandamos un correo en cada etapa: pago confirmado, preparación y despacho (con el link del courier). También puedes verlo en{' '}
        <Link to="/seguimiento" className="font-medium text-ink underline decoration-gold underline-offset-4">Seguir mi pedido</Link> con tu número de pedido y email.
      </>
    ),
  },
  {
    q: '¿Qué medios de pago aceptan?',
    a: `Pagas con Mercado Pago: tarjetas de crédito, débito y los medios que Mercado Pago tenga disponibles. Reservamos tu stock por ${PAYMENT_WINDOW_MINUTES} minutos mientras completas el pago.`,
  },
  {
    q: '¿Puedo pedir factura?',
    a: 'Sí. En el checkout eliges boleta o factura e ingresas RUT, razón social y giro de tu empresa.',
  },
  {
    q: '¿Cómo me hago distribuidor?',
    a: (
      <>
        La compra mínima es de {DISTRIBUTOR.minBoxes} embalajes de {DISTRIBUTOR.unitsPerBox} cremas ({DISTRIBUTOR_MIN_UNITS} unidades) por {formatCLP(DISTRIBUTOR_MIN_TOTAL)}, y cada crema te queda a {formatCLP(DISTRIBUTOR.unitCost)}. Postula en{' '}
        <Link to="/distribuidores" className="font-medium text-ink underline decoration-gold underline-offset-4">Distribuidores</Link> y te contactamos.
      </>
    ),
  },
  {
    q: '¿Hacen capacitaciones para barberos?',
    a: (
      <>
        Sí. Tomás Morales realiza seminarios y clases prácticas de alisado en distintas ciudades. Revisa las fechas y cupos en{' '}
        <Link to="/capacitaciones" className="font-medium text-ink underline decoration-gold underline-offset-4">Capacitaciones</Link>.
      </>
    ),
  },
  {
    q: '¿Son distribuidores oficiales de DASHU?',
    a: `${STORE.legalNotice} Todos nuestros productos son originales de la marca.`,
  },
  {
    q: '¿Tienen cambios y devoluciones?',
    a: (
      <>
        Sí, revisa nuestra <Link to="/devoluciones" className="font-medium text-ink underline decoration-gold underline-offset-4">política de cambios y devoluciones</Link>.
      </>
    ),
  },
]

export function Faq() {
  return (
    <section id="preguntas" className="py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que necesitas saber" />
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} title={f.q} defaultOpen={i === 0}>{f.a}</AccordionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
