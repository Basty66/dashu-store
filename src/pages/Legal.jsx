import { Link } from 'react-router-dom'
import { STORE, PAYMENT_WINDOW_MINUTES } from '@shared/store.js'
import { useConfig } from '../store/storeConfig'
import { PageShell, Prose } from '../components/templates/PageShell'

const updated = 'Última actualización: septiembre de 2026'

export function Terms() {
  const email = useConfig((c) => c.contact.email)
  return (
    <PageShell eyebrow="Legal" title="Términos y condiciones" description={updated}>
      <Prose>
        <section><h2>1. Quiénes somos</h2><p>{STORE.name} vende productos de la marca DASHU en Chile a través de este sitio. {STORE.legalNotice}</p></section>
        <section><h2>2. Precios y formatos</h2><p>Los precios se muestran en pesos chilenos y son el valor final del producto. Vendemos por unidad y en packs; el precio por unidad de cada pack se informa antes de comprar. El costo de envío se muestra en el checkout antes del pago.</p></section>
        <section><h2>3. Stock y reserva</h2><p>Al confirmar tu pedido reservamos el stock por {PAYMENT_WINDOW_MINUTES} minutos mientras completas el pago en Mercado Pago. Si el pago no se completa en ese plazo, la reserva se libera automáticamente.</p></section>
        <section><h2>4. Pagos</h2><p>Los pagos se procesan a través de Mercado Pago. {STORE.name} no almacena datos de tarjetas. El pedido se confirma cuando Mercado Pago aprueba el pago.</p></section>
        <section><h2>5. Despacho</h2><p>Despachamos a todo Chile por courier. Cuando tu pedido sale, te enviamos el nombre del courier y el número de seguimiento. Los plazos de entrega dependen del courier y de la localidad de destino.</p></section>
        <section><h2>6. Boleta y factura</h2><p>Emitimos boleta o factura según lo que elijas en el checkout. Para factura debes indicar RUT, razón social y giro correctos.</p></section>
        <section><h2>7. Cambios, devoluciones y garantía</h2><p>Revisa nuestra <Link to="/devoluciones">política de cambios y devoluciones</Link>, que se ajusta a la Ley N° 19.496 de Protección de los Derechos de los Consumidores.</p></section>
        <section><h2>8. Uso del producto</h2><p>Sigue siempre las instrucciones del envase. Te recomendamos probar primero en una mecha pequeña y evitar el contacto con ojos o piel irritada.</p></section>
        <section><h2>9. Contacto</h2><p>Para cualquier consulta escríbenos a <a href={`mailto:${email}`}>{email}</a> o desde la página de <Link to="/contacto">contacto</Link>.</p></section>
      </Prose>
    </PageShell>
  )
}

export function Privacy() {
  const email = useConfig((c) => c.contact.email)
  return (
    <PageShell eyebrow="Legal" title="Política de privacidad" description={updated}>
      <Prose>
        <section><h2>Qué datos pedimos</h2><p>Nombre, email, teléfono y dirección de despacho para procesar tu pedido; y RUT, razón social y giro si pides factura.</p></section>
        <section><h2>Para qué los usamos</h2><ul><li>Procesar, despachar y hacer seguimiento de tus pedidos.</li><li>Enviarte avisos sobre el estado de tu compra.</li><li>Emitir la boleta o factura correspondiente.</li><li>Responder tus consultas.</li></ul></section>
        <section><h2>Con quién los compartimos</h2><p>Solo con quienes necesitamos para completar tu compra: Mercado Pago (pago) y la empresa de courier (despacho). No vendemos ni cedemos tus datos a terceros.</p></section>
        <section><h2>Pagos</h2><p>Los datos de tu tarjeta los ingresas directamente en Mercado Pago. Nosotros nunca los vemos ni los guardamos.</p></section>
        <section><h2>Tus derechos</h2><p>De acuerdo con la Ley N° 19.628 sobre protección de la vida privada, puedes pedir acceso, rectificación o eliminación de tus datos escribiendo a <a href={`mailto:${email}`}>{email}</a>.</p></section>
        <section><h2>Almacenamiento en tu navegador</h2><p>Guardamos tu carrito y, para agilizar futuras compras, tus datos de despacho en el almacenamiento local de tu navegador. Puedes borrarlos cuando quieras desde la configuración del navegador.</p></section>
      </Prose>
    </PageShell>
  )
}

export function Returns() {
  const email = useConfig((c) => c.contact.email)
  return (
    <PageShell eyebrow="Legal" title="Cambios y devoluciones" description={updated}>
      <Prose>
        <section><h2>Derecho a retracto</h2><p>Por ser una compra a distancia, tienes 10 días desde que recibes el producto para retractarte, siempre que el producto esté sin abrir, sin uso y en su empaque original (artículo 3 bis de la Ley N° 19.496). Por tratarse de productos de cuidado personal, no aceptamos devoluciones de productos abiertos o usados, salvo falla.</p></section>
        <section><h2>Productos con falla o incorrectos</h2><p>Si recibes un producto dañado, defectuoso o distinto al que compraste, escríbenos dentro de las 48 horas siguientes a la recepción con fotos y tu número de pedido. Coordinamos el cambio o la devolución sin costo para ti.</p></section>
        <section><h2>Garantía legal</h2><p>Los productos cuentan con la garantía legal de 6 meses establecida en la Ley N° 19.496 para productos con fallas o defectos de fabricación.</p></section>
        <section><h2>Cómo solicitarlo</h2><p>Escríbenos a <a href={`mailto:${email}`}>{email}</a> o por <Link to="/contacto">contacto</Link> indicando tu número de pedido (DS-XXXXXX) y el motivo. Te responderemos con los pasos a seguir.</p></section>
        <section><h2>Reembolsos</h2><p>Una vez recibido y revisado el producto, reembolsamos a través de Mercado Pago al mismo medio de pago. Los plazos de abono dependen del emisor de tu tarjeta.</p></section>
      </Prose>
    </PageShell>
  )
}
