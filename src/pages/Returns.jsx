import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Returns() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 md:px-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone hover:text-navy transition-colors mb-8">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label text-xs text-gold">Legales</span>
          <h1 className="display-md text-navy mt-2 mb-8">Política de Devoluciones</h1>
          <div className="space-y-6 text-sm text-stone leading-relaxed">
            <section className="space-y-2">
              <h2 className="h-sm text-navy">1. Plazo de Devolución</h2>
              <p>Dispones de 10 días hábiles desde la recepción del producto para solicitar una devolución, de acuerdo a la Ley del Consumidor chilena (Ley 19.496).</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">2. Condiciones</h2>
              <p>El producto debe estar sin usar, en su empaque original y en las mismas condiciones en que fue recibido. No aceptamos devoluciones de productos que hayan sido abiertos o utilizados, por tratarse de productos de higiene y cuidado personal.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">3. Proceso</h2>
              <p>Para solicitar una devolución, contáctanos a través de nuestro formulario de contacto o correo electrónico indicando tu número de pedido y el motivo de la devolución. Te indicaremos los pasos a seguir y la dirección de envío.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">4. Reembolsos</h2>
              <p>Una vez recibido y verificado el producto, procederemos al reembolso a través del mismo método de pago utilizado en la compra. El plazo de reembolso es de hasta 10 días hábiles. Los costos de envío de la devolución son de cargo del cliente, salvo que el producto llegue dañado o incorrecto.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">5. Productos Dañados o Incorrectos</h2>
              <p>Si recibes un producto dañado o incorrecto, contáctanos dentro de las 24 horas siguientes a la recepción. Coordinaremos el cambio sin costo adicional para ti.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">6. Garantía</h2>
              <p>Todos nuestros productos cuentan con garantía legal de 3 meses según lo establecido en la Ley 19.496. La garantía cubre defectos de fabricación, no cubre mal uso o desgaste normal del producto.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
