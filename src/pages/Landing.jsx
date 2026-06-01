import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import AnimatedSection from '../components/AnimatedSection'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

const PRODUCT = {
  id: 1,
  name: 'Protein Down Cream 120ml',
  slug: 'protein-down-cream-120ml',
  description: 'Crema alisadora coreana para el cabello masculino. Alisa, nutre y controla el frizz con proteínas de rápida absorción. Sin químicos agresivos. Resultados visibles desde la primera aplicación.',
  price: 24990,
  stock: 42,
  sku: 'DPC-120',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const staggerItem = (i) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
})

const benefits = [
  { icon: '💧', t: 'Hidratación Profunda', d: 'Proteínas que penetran la fibra capilar sin pesar.' },
  { icon: '✨', t: 'Frizz Control', d: 'Cabello liso y manejable durante 24 horas.' },
  { icon: '⏱️', t: 'Resultados en 10 min', d: 'Aplicación rápida sin necesidad de enjuague.' },
  { icon: '🧪', t: 'Fórmula Coreana', d: 'Libre de sulfatos, parabenos y siliconas.' },
]

const rituals = [
  { n: '01', t: 'Aplica', d: 'Toma una cantidad moderada y distribuye en cabello húmedo o seco, enfocando en laterales y parte trasera.', tag: '10 min' },
  { n: '02', t: 'Peina', d: 'Usa un peine de dientes finos para direccionar el cabello hacia abajo, creando la forma deseada.', tag: '2 min' },
  { n: '03', t: 'Sella', d: 'Deja secar al aire o usa secador a baja temperatura para fijar el efecto down perm.', tag: '5 min' },
]

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [heroLoaded, setHeroLoaded] = useState(false)

  return (
    <div className="overflow-hidden">
      {/* ═══ HERO — editorial split ═══ */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left — Visual */}
        <div className="relative flex items-center justify-center min-h-[55vh] lg:min-h-screen bg-navy overflow-hidden order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light" />
          <div className="absolute top-1/3 -right-24 w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px]" />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 p-10 lg:p-16"
          >
            <img
              src={PRODUCT.image} alt="DASHU Protein Down Cream"
              onLoad={() => setHeroLoaded(true)}
              className="w-full max-w-sm mx-auto drop-shadow-2xl animate-float"
            />
          </motion.div>
          <div className="absolute bottom-10 left-10 hidden lg:block">
            <p className="text-white/15 text-[10px] tracking-[0.25em] uppercase">Corea del Sur · 2024</p>
          </div>
        </div>

        {/* Right — Content */}
        <div className="flex items-center px-6 lg:px-16 py-20 lg:py-0 order-1 lg:order-2 bg-cream">
          <div className="max-w-lg">
            <motion.div initial="hidden" animate="visible" variants={staggerItem(0)} className="flex items-center gap-3 mb-8">
              <span className="bg-navy text-cream text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5">Nuevo</span>
              <span className="text-stone text-[11px] tracking-widest uppercase">Down Perm Korea</span>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={staggerItem(1)}
              className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] tracking-[-0.02em] text-navy mb-3">
              Cabello liso,
            </motion.h1>
            <motion.h1 initial="hidden" animate="visible" variants={staggerItem(2)}
              className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] tracking-[-0.02em] text-gold mb-6">
              sin esfuerzo.
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={staggerItem(3)}
              className="text-sm text-stone leading-relaxed max-w-sm mb-8">
              {PRODUCT.description}
            </motion.p>

            {/* Trust badges */}
            <motion.div initial="hidden" animate="visible" variants={staggerItem(4)} className="flex flex-wrap gap-2 mb-8">
              {['Alisa al instante', 'Sin enjuague', 'Proteína coreana', 'Frizz control'].map((b, i) => (
                <span key={i} className="px-3 py-1.5 bg-white border border-navy/5 text-[11px] text-stone font-medium">
                  {b}
                </span>
              ))}
            </motion.div>

            {/* Price + Quantity */}
            <motion.div initial="hidden" animate="visible" variants={staggerItem(5)} className="flex items-center gap-6 mb-8">
              <div>
                <p className="font-bold text-3xl text-navy tracking-tight">${PRODUCT.price.toLocaleString('es-CL')}</p>
                <p className="text-[11px] text-stone mt-0.5">120 ml · IVA incluido</p>
              </div>
              <div className="flex items-center border border-navy/10 bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="w-9 text-center font-semibold text-sm text-navy">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial="hidden" animate="visible" variants={staggerItem(6)} className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => addItem(PRODUCT, qty)}
                className="btn-primary"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                Agregar al Carrito
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </motion.button>
              <a href="#ritual" className="btn-outline">
                Cómo Usarlo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div initial="hidden" animate="visible" variants={staggerItem(7)} className="flex items-center gap-5 mt-10 pt-6 border-t border-navy/5">
              <div className="stars text-sm">★★★★★</div>
              <p className="text-xs text-stone">+10,000 clientes satisfechos</p>
              <div className="divider-vertical h-4" />
              <p className="text-xs text-stone">🚚 Envío gratis +$50,000</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS — glass grid ═══ */}
      <section id="producto" className="section bg-cream">
        <div className="container-premium">
          <div className="text-center mb-16">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Beneficios</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Hecho para el hombre actual</h2>
              <p className="text-sm text-stone max-w-md mx-auto">Tecnología coreana en cada gota. Resultados visibles desde el día uno.</p>
            </AnimatedSection>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="glass-card p-6 lg:p-8 h-full text-center hover:bg-white/80 transition-all duration-500">
                  <span className="text-2xl mb-4 block">{b.icon}</span>
                  <h3 className="font-semibold text-sm text-navy mb-2">{b.t}</h3>
                  <p className="text-xs text-stone/80 leading-relaxed">{b.d}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="section bg-ivory">
        <div className="container-premium">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Resultados</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight">Antes y Después</h2>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <p className="text-sm text-stone max-w-xs leading-relaxed">
                Resultados visibles desde la primera aplicación. Cabello más manejable, liso y saludable.
              </p>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={0.08}>
            <div className="max-w-4xl mx-auto shadow-2xl shadow-navy/5">
              <BeforeAfterSlider />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ SCIENCE & RITUAL — dark premium ═══ */}
      <section id="ritual" className="section bg-navy relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[120px]" />
        <div className="container-premium relative z-10">
          <div className="text-center mb-16">
            <AnimatedSection>
              <span className="bg-white/10 text-white/50 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Ritual</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-white tracking-tight mb-3">Ciencia & Rutina</h2>
              <p className="text-sm text-white/40 max-w-md mx-auto">Tres pasos simples para un down perm perfecto en solo minutos.</p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {rituals.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] p-8 lg:p-10 h-full hover:bg-white/[0.06] transition-all duration-500">
                  <div className="flex items-start justify-between mb-6">
                    <div className="step-glow">{s.n}</div>
                    <span className="text-[11px] font-medium text-gold/80 tracking-wide">{s.tag}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-3">{s.t}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="section bg-cream">
        <div className="container-premium">
          <AnimatedSection>
            <div className="glass-card p-12 lg:p-20 text-center relative overflow-hidden">
              <div className="absolute top-[-40%] left-[-10%] w-[400px] h-[400px] bg-gold/[0.04] rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-5 inline-block">Comienza Hoy</span>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-4">Tu cabello, tu regla</h2>
                <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">
                  Únete a miles de hombres que ya dominan su look con DASHU.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.button
                    onClick={() => addItem(PRODUCT, 1)}
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
                  </motion.button>
                  <a href="/tracking" className="btn-outline text-xs">Seguir mi Pedido</a>
                </div>
                <div className="flex items-center justify-center gap-6 mt-8">
                  <div className="stars text-sm">★★★★★</div>
                  <p className="text-xs text-stone">+10,000 hombres confían en DASHU</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
