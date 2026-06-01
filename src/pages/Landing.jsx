import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import AnimatedSection from '../components/AnimatedSection'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

const PRODUCT = {
  id: 1, name: 'Protein Down Cream 120ml',
  description: 'Crema alisadora coreana para el cabello masculino. Alisa, nutre y controla el frizz con proteínas de rápida absorción. Sin químicos agresivos.',
  price: 24990, stock: 42,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const stagger = (i) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
})

const benefits = [
  {
    t: 'Hidratación Profunda',
    d: 'Proteínas que penetran la fibra capilar sin pesar. Cabello nutrido desde el interior.',
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  },
  {
    t: 'Frizz Control 24h',
    d: 'Cabello liso y manejable durante todo el día. Sin encrespamiento ni volumen no deseado.',
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 3c.5 3 3 5 3 8 0 3-3 5-3 8 0-3-3-5-3-8 0-3 2.5-5 3-8z"/><path d="M18 6c.5 2 2 3.5 2 6 0 2.5-2 4.5-2 7"/><path d="M6 6c-.5 2-2 3.5-2 6 0 2.5 2 4.5 2 7"/></svg>,
  },
  {
    t: 'Resultados en 10 min',
    d: 'Aplicación rápida sin necesidad de enjuague. Peina y sella tu estilo en minutos.',
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    t: 'Fórmula Coreana',
    d: 'Libre de sulfatos, parabenos y siliconas. Tecnología de última generación desde Corea.',
    svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  },
]

const rituals = [
  { n: '01', t: 'Aplica', d: 'Toma una cantidad moderada y distribuye en cabello húmedo o seco, enfocando en laterales y nuca.', tag: '10 min' },
  { n: '02', t: 'Peina', d: 'Usa un peine de dientes finos para direccionar el cabello hacia abajo, creando la forma deseada.', tag: '2 min' },
  { n: '03', t: 'Sella', d: 'Deja secar al aire o usa secador a baja temperatura para fijar el efecto down perm.', tag: '5 min' },
]

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [heroLoaded, setHeroLoaded] = useState(false)

  return (
    <div className="overflow-hidden bg-cream">
      {/* ═══ HERO — unified cream, floating product ═══ */}
      <section className="min-h-screen flex items-center relative pt-24 pb-0 lg:pb-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-navy/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center px-6 lg:px-10">
          {/* Left — Content */}
          <div className="py-16 lg:py-20">
            <motion.div initial="hidden" animate="visible" variants={stagger(0)}
              className="inline-flex items-center gap-3 mb-8">
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5">Nuevo</span>
              <span className="text-stone text-[11px] tracking-widest uppercase">Down Perm Korea</span>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={stagger(1)}
              className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.08] tracking-[-0.02em] text-navy mb-1">
              Cabello liso,
            </motion.h1>
            <motion.h1 initial="hidden" animate="visible" variants={stagger(2)}
              className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.08] tracking-[-0.02em] text-gold mb-6">
              sin esfuerzo.
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={stagger(3)}
              className="text-sm text-stone leading-relaxed max-w-md mb-8">
              {PRODUCT.description}
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={stagger(4)}
              className="flex flex-wrap gap-2 mb-10">
              {['Alisa al instante', 'Sin enjuague', 'Proteína coreana', 'Frizz control'].map((b, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/50 backdrop-blur-sm border border-white/60 text-[11px] text-stone font-medium">
                  {b}
                </span>
              ))}
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={stagger(5)}
              className="flex items-center gap-6 mb-8">
              <div>
                <p className="font-bold text-3xl text-navy tracking-tight">${PRODUCT.price.toLocaleString('es-CL')}</p>
                <p className="text-[11px] text-stone mt-0.5">120 ml · IVA incluido</p>
              </div>
              <div className="flex items-center border border-navy/8 bg-white/60 backdrop-blur-sm">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="w-9 text-center font-semibold text-sm text-navy">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={stagger(6)}
              className="flex flex-wrap gap-3">
              <motion.button onClick={() => addItem(PRODUCT, qty)} className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Agregar al Carrito
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </motion.button>
              <a href="#ritual" className="btn-outline">
                Cómo Usarlo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </a>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={stagger(7)}
              className="flex items-center gap-5 mt-10 pt-6 border-t border-navy/[0.04]">
              <div className="stars text-sm">★★★★★</div>
              <p className="text-xs text-stone">+10,000 clientes satisfechos</p>
              <div className="w-px h-4 bg-navy/5" />
              <p className="text-xs text-stone">Envío gratis +$50,000</p>
            </motion.div>
          </div>

          {/* Right — Floating product */}
          <div className="relative flex items-center justify-center py-10 lg:py-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-gold/[0.03] rounded-full blur-[80px]" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <img
                src={PRODUCT.image} alt="DASHU Protein Down Cream"
                onLoad={() => setHeroLoaded(true)}
                className="w-full max-w-xs lg:max-w-md mx-auto animate-float drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(11,25,44,0.08))' }}
              />
            </motion.div>
            <div className="absolute -bottom-4 -left-4 lg:-bottom-8 lg:-left-8">
              <div className="glass-card-strong px-5 py-3">
                <p className="text-[11px] font-semibold text-navy">★★★★★</p>
                <p className="text-[10px] text-stone mt-0.5">Valorado por +2,000 hombres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS — floating glass cards ═══ */}
      <section className="section">
        <div className="container-wide">
          <div className="text-center mb-14">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Beneficios</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Hecho para el hombre actual</h2>
              <p className="text-sm text-stone max-w-md mx-auto">Tecnología coreana en cada gota. Resultados visibles desde el día uno.</p>
            </AnimatedSection>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {benefits.map((b, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="glass-card p-6 lg:p-8 h-full group hover:bg-white/60 transition-all duration-500">
                  <div className="w-10 h-10 bg-navy/5 flex items-center justify-center mb-5 group-hover:bg-navy/10 transition-colors duration-500">
                    {b.svg}
                  </div>
                  <h3 className="font-semibold text-sm text-navy mb-2">{b.t}</h3>
                  <p className="text-xs text-stone/80 leading-relaxed">{b.d}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER — clean centered ═══ */}
      <section className="section bg-ivory/50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Resultados</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Antes y Después</h2>
              <p className="text-sm text-stone max-w-md mx-auto">Resultados visibles desde la primera aplicación.</p>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={0.08}>
            <div className="glass-card-strong p-3 max-w-3xl mx-auto">
              <BeforeAfterSlider />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ RITUAL — glass cards over subtle gradient ═══ */}
      <section id="ritual" className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-ivory/40 to-cream pointer-events-none" />
        <div className="container-wide relative z-10">
          <div className="text-center mb-14">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Ritual</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Ciencia & Rutina</h2>
              <p className="text-sm text-stone max-w-md mx-auto">Tres pasos simples para un down perm perfecto en minutos.</p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {rituals.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="glass-card p-8 lg:p-10 h-full group hover:bg-white/60 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="step-num">{s.n}</div>
                    <span className="text-[11px] font-medium text-gold/70 tracking-wide">{s.tag}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-navy mb-3">{s.t}</h3>
                  <p className="text-sm text-stone/70 leading-relaxed">{s.d}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — glass card ═══ */}
      <section className="section">
        <div className="container-wide">
          <AnimatedSection>
            <div className="glass-card-strong p-12 lg:p-20 text-center relative overflow-hidden">
              <div className="absolute top-[-40%] left-[-10%] w-[400px] h-[400px] bg-gold/[0.04] rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-5 inline-block">Comienza Hoy</span>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-4">Tu cabello, tu regla</h2>
                <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">
                  Únete a miles de hombres que ya dominan su look con DASHU.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.button onClick={() => addItem(PRODUCT, 1)} className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
                  </motion.button>
                  <a href="/tracking" className="btn-outline">Seguir mi Pedido</a>
                </div>
                <div className="flex items-center justify-center gap-5 mt-8">
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
