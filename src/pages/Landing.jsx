import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import AnimatedSection from '../components/AnimatedSection'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import MagneticButton from '../components/MagneticButton'
import SpotlightCard from '../components/SpotlightCard'
import KineticText from '../components/KineticText'

const PRODUCT = {
  id: 1, name: 'Protein Down Cream 120ml',
  description: 'Crema alisadora coreana para el cabello masculino. Alisa, nutre y controla el frizz con proteínas de rápida absorción. Sin químicos agresivos.',
  price: 24990, stock: 42,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const benefits = [
  { t: 'Hidratación Profunda', d: 'Proteínas que penetran la fibra capilar sin pesar. Cabello nutrido desde el interior.' },
  { t: 'Frizz Control 24h', d: 'Cabello liso y manejable durante todo el día. Sin encrespamiento ni volumen no deseado.' },
  { t: 'Resultados en 10 min', d: 'Aplicación rápida sin enjuague. Peina y sella tu estilo en minutos.' },
  { t: 'Fórmula Coreana', d: 'Libre de sulfatos, parabenos y siliconas. Tecnología desde Corea.' },
  { t: 'Aroma Premium', d: 'Fragancia fresca y masculina que perdura todo el día sin ser abrumadora.' },
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
  const [activeStep, setActiveStep] = useState(0)
  const ritualRef = useRef(null)

  useEffect(() => {
    const el = ritualRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const steps = el.querySelectorAll('.ritual-step')
          steps.forEach((s, i) => {
            const stepObs = new IntersectionObserver(
              ([se]) => { if (se.isIntersecting) setActiveStep(i) },
              { threshold: 0.5 }
            )
            stepObs.observe(s)
          })
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="overflow-hidden bg-cream">
      {/* ─── AMBIENT ORBS ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="orb orb-cream animate-orb" style={{ top: '5%', left: '-10%', opacity: 0.5 }} />
        <div className="orb orb-gold animate-orb-reverse" style={{ bottom: '30%', right: '-5%', opacity: 0.4 }} />
        <div className="orb orb-navy" style={{ top: '50%', left: '40%', opacity: 0.3 }} />
      </div>

      {/* ═══ HERO — asymmetrical, kinetic, overlapping ═══ */}
      <section className="min-h-screen flex items-center relative pt-24" style={{ zIndex: 1 }}>
        <div className="container-wide relative grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center px-6 lg:px-10">
          {/* Hero content — spans 7 cols */}
          <div className="lg:col-span-7 py-16 lg:py-20 relative z-10">
            <motion.div initial="hidden" animate="visible"
              className="inline-flex items-center gap-3 mb-8">
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5">Nuevo</span>
              <span className="text-stone text-[11px] tracking-widest uppercase">Down Perm Korea</span>
            </motion.div>

            <KineticText text="Cabello liso," className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.08] tracking-[-0.02em] text-navy" />
            <KineticText text="sin esfuerzo." tag="p" delay={0.15} className="font-display font-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.08] tracking-[-0.02em] text-gold mb-6" />

            <AnimatedSection delay={0.3}>
              <p className="text-sm text-stone leading-relaxed max-w-md mb-8">{PRODUCT.description}</p>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="flex flex-wrap gap-2 mb-10">
                {['Alisa al instante', 'Sin enjuague', 'Proteína coreana', 'Frizz control'].map((b, i) => (
                  <span key={i} className="glass px-3 py-1.5 text-[11px] text-stone font-medium">{b}</span>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <div className="flex items-center gap-6 mb-8">
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
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <div className="flex flex-wrap gap-3">
                <MagneticButton onClick={() => addItem(PRODUCT, qty)} className="btn-primary">
                  Agregar al Carrito
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </MagneticButton>
                <a href="#ritual" className="btn-outline">
                  Cómo Usarlo
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.7}>
              <div className="flex items-center gap-5 mt-10 pt-6 border-t border-navy/[0.04]">
                <div className="stars text-sm">★★★★★</div>
                <p className="text-xs text-stone">+10,000 clientes satisfechos</p>
                <div className="w-px h-4 bg-navy/5" />
                <p className="text-xs text-stone">Envío gratis +$50,000</p>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero image — spans 5 cols, overlaps section boundary */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:pl-8" style={{ zIndex: 5 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] bg-gold/[0.04] rounded-full blur-[100px]" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <img
                src={PRODUCT.image} alt="DASHU Protein Down Cream"
                onLoad={() => setHeroLoaded(true)}
                className="w-full max-w-xs lg:max-w-md mx-auto animate-float-idle drop-shadow-2xl"
              />
            </motion.div>
            {/* Floating badge overlapping hero and next section */}
            <div className="absolute -bottom-2 -left-4 lg:-bottom-6 lg:-left-8 z-20">
              <div className="glass-strong px-5 py-3 animate-pulse-glow">
                <p className="text-[11px] font-semibold text-navy">★★★★★</p>
                <p className="text-[10px] text-stone mt-0.5">Valorado por +2,000 hombres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS — bento grid (2-1-2 asymmetrical) ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="container-wide">
          <div className="mb-14 max-w-xl">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Beneficios</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Ciencia coreana para tu rutina diaria</h2>
              <p className="text-sm text-stone">Cada gota formulada para el cabello masculino. Resultados visibles desde el día uno.</p>
            </AnimatedSection>
          </div>

          {/* Bento asymmetrical grid */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5">
            {/* Tall card (first benefit) */}
            <SpotlightCard className="lg:col-span-5 row-span-2 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-navy/5 flex items-center justify-center mb-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-navy mb-3">{benefits[0].t}</h3>
                <p className="text-sm text-stone/70 leading-relaxed">{benefits[0].d}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-navy/[0.03]">
                <p className="text-[11px] text-gold font-medium tracking-wide">Penetración profunda sin pesar</p>
              </div>
            </SpotlightCard>

            {/* Second benefit */}
            <SpotlightCard className="lg:col-span-7 p-6 lg:p-8">
              <div>
                <div className="w-8 h-8 bg-navy/5 flex items-center justify-center mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 3c.5 3 3 5 3 8 0 3-3 5-3 8 0-3-3-5-3-8 0-3 2.5-5 3-8z"/><path d="M18 6c.5 2 2 3.5 2 6 0 2.5-2 4.5-2 7"/><path d="M6 6c-.5 2-2 3.5-2 6 0 2.5 2 4.5 2 7"/></svg>
                </div>
                <h3 className="font-semibold text-sm text-navy mb-2">{benefits[1].t}</h3>
                <p className="text-xs text-stone/80 leading-relaxed">{benefits[1].d}</p>
              </div>
            </SpotlightCard>

            {/* Third benefit */}
            <SpotlightCard className="lg:col-span-4 p-6 lg:p-8">
              <div>
                <div className="w-8 h-8 bg-navy/5 flex items-center justify-center mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3 className="font-semibold text-sm text-navy mb-2">{benefits[2].t}</h3>
                <p className="text-xs text-stone/80 leading-relaxed">{benefits[2].d}</p>
              </div>
            </SpotlightCard>

            {/* Fourth benefit */}
            <SpotlightCard className="lg:col-span-4 p-6 lg:p-8">
              <div>
                <div className="w-8 h-8 bg-navy/5 flex items-center justify-center mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </div>
                <h3 className="font-semibold text-sm text-navy mb-2">{benefits[3].t}</h3>
                <p className="text-xs text-stone/80 leading-relaxed">{benefits[3].d}</p>
              </div>
            </SpotlightCard>

            {/* Fifth benefit — wider */}
            <SpotlightCard className="lg:col-span-4 p-6 lg:p-8">
              <div>
                <div className="w-8 h-8 bg-navy/5 flex items-center justify-center mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </div>
                <h3 className="font-semibold text-sm text-navy mb-2">{benefits[4].t}</h3>
                <p className="text-xs text-stone/80 leading-relaxed">{benefits[4].d}</p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER — full-bleed mask clip ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="container-wide">
          <div className="mb-12 max-w-lg">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Resultados</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">La diferencia es visible</h2>
              <p className="text-sm text-stone">Un solo uso. Sin filtros. Resultados reales desde la primera aplicación.</p>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={0.08}>
            <BeforeAfterSlider />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ RITUAL — scroll-linked progress bar ═══ */}
      <section id="ritual" ref={ritualRef} className="section relative" style={{ zIndex: 1 }}>
        <div className="container-wide">
          <div className="mb-14 max-w-lg">
            <AnimatedSection>
              <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Ritual</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">Ciencia & rutina en tres movimientos</h2>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {rituals.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={`ritual-step spotlight-card p-8 lg:p-10 h-full transition-all duration-500 ${activeStep === i ? 'ring-1 ring-gold/20' : ''}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`step-glow transition-all duration-700 ${activeStep === i ? 'shadow-lg shadow-gold/15 scale-110' : ''}`}>
                      <span className="relative z-10">{s.n}</span>
                    </div>
                    <span className="text-[11px] font-medium text-gold/70 tracking-wide">{s.tag}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-navy mb-3">{s.t}</h3>
                  <p className="text-sm text-stone/70 leading-relaxed">{s.d}</p>
                  {/* Progress line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <div className={`w-6 h-[1px] transition-colors duration-700 ${activeStep >= i ? 'bg-gold/40' : 'bg-navy/5'}`} />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Scroll progress indicator */}
          <div className="flex justify-center gap-2 mt-10">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${activeStep === i ? 'bg-gold w-6' : 'bg-navy/10'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — glass overlap ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="container-wide">
          <AnimatedSection>
            <SpotlightCard className="p-12 lg:p-20 text-center relative overflow-hidden" as="div">
              <div className="absolute top-[-40%] left-[-10%] w-[400px] h-[400px] bg-gold/[0.04] rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-5 inline-block">Comienza Hoy</span>
                <KineticText text="Tu cabello, tu regla" className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-4" />
                <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">
                  Únete a miles de hombres que ya dominan su look con DASHU.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <MagneticButton onClick={() => addItem(PRODUCT, 1)} className="btn-primary">
                    Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
                  </MagneticButton>
                  <a href="/tracking" className="btn-outline">Seguir mi Pedido</a>
                </div>
                <div className="flex items-center justify-center gap-5 mt-8">
                  <div className="stars text-sm">★★★★★</div>
                  <p className="text-xs text-stone">+10,000 hombres confían en DASHU</p>
                </div>
              </div>
            </SpotlightCard>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
