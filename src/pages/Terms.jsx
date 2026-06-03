import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 md:px-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone hover:text-navy transition-colors mb-8">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label text-xs text-gold">Legales</span>
          <h1 className="display-md text-navy mt-2 mb-8">Términos y Condiciones</h1>
          <div className="space-y-6 text-sm text-stone leading-relaxed">
            <section className="space-y-2">
              <h2 className="h-sm text-navy">1. Aceptación de los Términos</h2>
              <p>Al realizar una compra en DASHU FOR MEN, declaras haber leído, entendido y aceptado los presentes términos y condiciones. Si no estás de acuerdo con alguna parte, no debes usar este sitio.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">2. Productos</h2>
              <p>Todos los productos son originales e importados directamente desde Corea del Sur. Las imágenes son referenciales y pueden tener ligeras variaciones respecto al producto final. Nos reservamos el derecho de modificar las especificaciones sin previo aviso.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">3. Precios y Pagos</h2>
              <p>Los precios están expresados en pesos chilenos (CLP) e incluyen IVA. DASHU FOR MEN se reserva el derecho de modificar precios en cualquier momento. Los pagos se procesan a través de Webpay Plus o Mercado Pago, garantizando la seguridad de tus datos financieros.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">4. Envíos</h2>
              <p>Realizamos envíos a todo Chile a través de empresas de courier. Los plazos de entrega varían según la región y la disponibilidad del producto. No nos hacemos responsables por demoras atribuibles al courier o a causas de fuerza mayor.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">5. Propiedad Intelectual</h2>
              <p>Todos los contenidos del sitio, incluyendo marcas, logos, textos, imágenes y diseño, son propiedad de DASHU FOR MEN. Queda prohibida su reproducción sin autorización expresa.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">6. Modificaciones</h2>
              <p>DASHU FOR MEN se reserva el derecho de actualizar estos términos en cualquier momento. Los cambios serán publicados en esta página y entrarán en vigencia inmediatamente después de su publicación.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
