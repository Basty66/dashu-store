import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 md:px-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone hover:text-navy transition-colors mb-8">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label text-xs text-gold">Legales</span>
          <h1 className="display-md text-navy mt-2 mb-8">Política de Privacidad</h1>
          <div className="space-y-6 text-sm text-stone leading-relaxed">
            <section className="space-y-2">
              <h2 className="h-sm text-navy">1. Datos que Recopilamos</h2>
              <p>Recopilamos la información que nos proporcionas al realizar una compra: nombre, correo electrónico, teléfono, dirección de envío y región. También recopilamos datos de navegación anónimos para mejorar la experiencia del sitio.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">2. Uso de la Información</h2>
              <p>Tus datos se utilizan exclusivamente para procesar y despachar tus pedidos, comunicarnos contigo respecto a tu compra, y mejorar nuestros productos y servicios. No compartimos tu información con terceros no relacionados con el proceso de compra.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">3. Seguridad de los Datos</h2>
              <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal. Los pagos son procesados por Webpay Plus y Mercado Pago, que cumplen con los más altos estándares de seguridad.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">4. Tus Derechos</h2>
              <p>Puedes solicitar la modificación o eliminación de tus datos personales en cualquier momento escribiéndonos a nuestro correo de contacto. De acuerdo a la Ley 19.628 sobre protección de datos personales, tienes derecho a acceder, rectificar y cancelar tus datos.</p>
            </section>
            <section className="space-y-2">
              <h2 className="h-sm text-navy">5. Cookies</h2>
              <p>Este sitio utiliza cookies necesarias para el funcionamiento del carrito de compras. No utilizamos cookies de rastreo publicitario sin tu consentimiento explícito.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
