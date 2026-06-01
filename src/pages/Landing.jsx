import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import AnimatedSection from '../components/AnimatedSection'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import KineticText from '../components/KineticText'

const PRODUCT = {
  id: 1, name: 'Protein Down Cream 120ml',
  description: 'Crema alisadora coreana para el cabello masculino. Alisa, nutre y controla el frizz con proteínas de rápida absorción.',
  price: 24990, stock: 42,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const benefits = [
  { t: 'Hidratación profunda', d: 'Proteínas que penetran la fibra capilar sin pesar. Cabello nutrido desde el interior, visiblemente más sano.' },
  { t: 'Frizz control 24h', d: 'Cabello liso y manejable durante todo el día. Sin encrespamiento.' },
  { t: 'Resultados en 10 min', d: 'Aplicación rápida, sin enjuague. Peina y sella tu estilo.' },
  { t: 'Tecnología coreana', d: 'Libre de sulfatos, parabenos y siliconas. Hecho en Corea.' },
  { t: 'Aroma masculino', d: 'Fragancia fresca y sofisticada que perdura sin ser abrumadora.' },
]

const rituals = [
  { n: '01', t: 'Aplica', d: 'Distribuye en cabello húmedo o seco, enfocando en laterales y nuca.' },
  { n: '02', t: 'Peina', d: 'Usa un peine de dientes finos para direccionar hacia abajo.' },
  { n: '03', t: 'Sella', d: 'Deja secar al aire o usa secador a baja temperatura.' },
]

function KineticHero({ text, className = '', delay = 0 }) {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <h1 ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="kinetic-word" style={{ transitionDelay: `${delay + i * 0.09}s` + (revealed ? '' : ', 0s') }}
          ref={el => { if (el && revealed) el.classList.add('revealed') }}>
          {w}{' '}
        </span>
      ))}
    </h1>
  )
}

function RitualStep({ step, index, activeIndex }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex items-start gap-6 lg:gap-8"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.15}s` }}>
      <div className="flex flex-col items-center">
        <div className={`step-node transition-all duration-700 ${activeIndex === index ? 'shadow-lg shadow-gold/20 scale-110 glow-ring' : ''}`}>
          <span className="relative z-10">{step.n}</span>
        </div>
        {index < rituals.length - 1 && (
          <div className={`w-[1px] h-16 lg:h-24 transition-all duration-700 ${activeIndex > index ? 'bg-gold/30' : 'bg-navy/5'}`} />
        )}
      </div>
      <div className="pt-2 flex-1">
        <h3 className={`font-display font-semibold text-xl text-navy mb-2 transition-colors duration-500 ${activeIndex === index ? 'text-gold' : ''}`}>{step.t}</h3>
        <p className="text-sm text-stone/70 leading-relaxed">{step.d}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [activeRitual, setActiveRitual] = useState(-1)
  const ritualContainer = useRef(null)

  useEffect(() => {
    const container = ritualContainer.current
    if (!container) return
    const steps = container.querySelectorAll('.ritual-observe')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.dataset.index)
          setActiveRitual(idx)
        }
      })
    }, { threshold: 0.4 })
    steps.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="overflow-hidden bg-cream">
      {/* ─── AMBIENT ORB LAYER ─── */}
      <div className="orb-layer">
        <div className="orb orb-1 animate-orb-drift" />
        <div className="orb orb-2 animate-orb-reverse" />
        <div className="orb orb-3 animate-orb-drift" style={{ animationDuration: '35s' }} />
        <div className="orb orb-4" />
        <div className="orb orb-5 animate-orb-reverse" style={{ animationDuration: '20s' }} />
      </div>

      {/* ═══ HERO — fully asymmetrical, no grid ═══ */}
      <section className="min-h-screen flex items-center relative pt-24 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="w-full px-6 lg:px-12 relative">
          <div className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-0">
            {/* Left content */}
            <div className="relative z-10 max-w-2xl lg:pt-20">
              <div className="flex items-center gap-3 mb-6 opacity-0 animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5">Nuevo</span>
                <span className="text-stone text-[11px] tracking-widest uppercase">Down Perm Korea</span>
              </div>

              <KineticHero text="Cabello liso, sin esfuerzo."
                className="font-display font-bold text-[clamp(3rem,8vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-navy mb-3"
                delay={0.3} />

              <div className="max-w-md mt-6 opacity-0 animate-scale-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <p className="text-sm text-stone/80 leading-relaxed mb-8">{PRODUCT.description}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['Alisa al instante', 'Sin enjuague', 'Proteína coreana', 'Frizz control'].map((b, i) => (
                    <span key={i} className="glass px-3 py-1.5 text-[11px] text-stone font-medium">{b}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 mb-8">
                  <div>
                    <p className="font-bold text-3xl text-navy tracking-tight">${PRODUCT.price.toLocaleString('es-CL')}</p>
                    <p className="text-[11px] text-stone mt-0.5">120 ml · IVA incluido</p>
                  </div>
                  <div className="flex items-center border border-navy/8 bg-white/50 backdrop-blur-sm">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <span className="w-9 text-center font-semibold text-sm text-navy">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-navy/5 transition-colors text-stone">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <motion.button onClick={() => addItem(PRODUCT, qty)} className="btn-primary"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left)/r.width)*100}%`); e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top)/r.height)*100}%`) }}>
                    Agregar al Carrito
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </motion.button>
                  <a href="#ritual" className="btn-outline">Cómo Usarlo</a>
                </div>
              </div>
            </div>

            {/* Right — product floating, overlapping text area */}
            <div className="relative lg:absolute lg:right-0 lg:top-0 lg:w-1/2 h-full flex items-center justify-center" style={{ zIndex: 5 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] bg-gold/[0.05] rounded-full blur-[120px]" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <img
                  src={PRODUCT.image} alt="DASHU Protein Down Cream"
                  onLoad={() => setHeroLoaded(true)}
                  className="w-full max-w-xs lg:max-w-lg mx-auto animate-float-slow drop-shadow-2xl"
                />
              </motion.div>
            </div>
          </div>

          {/* Floating glass badges */}
          <div className="absolute left-[5%] bottom-[15%] hidden lg:block animate-float-slow" style={{ animationDuration: '14s', animationDelay: '-3s', zIndex: 10 }}>
            <div className="glass-strong px-5 py-4 animate-pulse-glass">
              <p className="text-[11px] font-semibold text-navy">★★★★★</p>
              <p className="text-[10px] text-stone mt-0.5">Valorado por +2,000 hombres</p>
            </div>
          </div>
          <div className="absolute right-[8%] top-[15%] hidden lg:block animate-float-slow" style={{ animationDuration: '12s', animationDelay: '-6s', zIndex: 10 }}>
            <div className="glass-strong px-4 py-3">
              <p className="text-[11px] font-medium text-navy">42 unid. disponibles</p>
            </div>
          </div>

          {/* Rating bar */}
          <div className="mt-10 lg:mt-6 flex items-center gap-5 opacity-0 animate-scale-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            <div className="stars text-sm">★★★★★</div>
            <p className="text-xs text-stone">+10,000 clientes satisfechos</p>
            <div className="w-px h-4 bg-navy/5" />
            <p className="text-xs text-stone">Envío gratis +$50,000</p>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS — truly broken bento with overlapping glass ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="px-6 lg:px-12">
          <AnimatedSection>
            <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Beneficios</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3 max-w-xl">Ciencia coreana para tu rutina diaria</h2>
            <p className="text-sm text-stone max-w-md mb-12">Cada gota formulada para el cabello masculino. Resultados visibles desde el día uno.</p>
          </AnimatedSection>

          {/* Broken bento — 5 cards at varying sizes + overlapping */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {/* Hero card: large, spans 2 cols */}
            <div className="lg:col-span-2 lg:row-span-2 relative" style={{ zIndex: 5 }}>
              <AnimatedSection>
                <div className="spotlight p-8 lg:p-12 h-full flex flex-col justify-between min-h-[280px] lg:min-h-[340px]">
                  <div>
                    <div className="w-12 h-12 bg-navy/5 flex items-center justify-center mb-6">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    </div>
                    <h3 className="font-display font-semibold text-xl text-navy mb-3">{benefits[0].t}</h3>
                    <p className="text-sm text-stone/70 leading-relaxed max-w-sm">{benefits[0].d}</p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-navy/[0.03]">
                    <p className="text-[11px] text-gold font-medium tracking-wide">Penetración profunda sin pesar</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Card 2 */}
            <div className="relative" style={{ zIndex: 4 }}>
              <AnimatedSection delay={0.06}>
                <div className="spotlight p-6 lg:p-8 h-full min-h-[180px] lg:min-h-[200px] relative">
                  <div className="w-9 h-9 bg-navy/5 flex items-center justify-center mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M12 3c.5 3 3 5 3 8 0 3-3 5-3 8 0-3-3-5-3-8 0-3 2.5-5 3-8z"/><path d="M18 6c.5 2 2 3.5 2 6 0 2.5-2 4.5-2 7"/><path d="M6 6c-.5 2-2 3.5-2 6 0 2.5 2 4.5 2 7"/></svg>
                  </div>
                  <h3 className="font-semibold text-sm text-navy mb-2">{benefits[1].t}</h3>
                  <p className="text-xs text-stone/80 leading-relaxed">{benefits[1].d}</p>
                </div>
              </AnimatedSection>
            </div>

            {/* Card 3 — overlapped slightly by card 2 */}
            <div className="relative lg:-ml-4 lg:mt-4" style={{ zIndex: 6 }}>
              <AnimatedSection delay={0.1}>
                <div className="spotlight p-6 lg:p-8 h-full min-h-[180px] lg:min-h-[200px]">
                  <div className="w-9 h-9 bg-navy/5 flex items-center justify-center mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <h3 className="font-semibold text-sm text-navy mb-2">{benefits[2].t}</h3>
                  <p className="text-xs text-stone/80 leading-relaxed">{benefits[2].d}</p>
                </div>
              </AnimatedSection>
            </div>

            {/* Card 4 */}
            <div className="relative" style={{ zIndex: 3 }}>
              <AnimatedSection delay={0.14}>
                <div className="spotlight p-6 lg:p-8 h-full min-h-[180px]">
                  <div className="w-9 h-9 bg-navy/5 flex items-center justify-center mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  </div>
                  <h3 className="font-semibold text-sm text-navy mb-2">{benefits[3].t}</h3>
                  <p className="text-xs text-stone/80 leading-relaxed">{benefits[3].d}</p>
                </div>
              </AnimatedSection>
            </div>

            {/* Card 5 — spans 2 cols */}
            <div className="lg:col-span-2 relative lg:-mt-6" style={{ zIndex: 2 }}>
              <AnimatedSection delay={0.18}>
                <div className="spotlight p-6 lg:p-8 h-full min-h-[160px] flex items-center gap-6">
                  <div className="w-9 h-9 bg-navy/5 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-navy mb-1">{benefits[4].t}</h3>
                    <p className="text-xs text-stone/80 leading-relaxed">{benefits[4].d}</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER — full bleed mask clip ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="px-6 lg:px-12 max-w-5xl">
          <AnimatedSection>
            <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Resultados</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-3">La diferencia es visible</h2>
            <p className="text-sm text-stone mb-10 max-w-md">Un solo uso. Sin filtros. Resultados reales desde la primera aplicación.</p>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <div className="glass-deep p-2">
              <BeforeAfterSlider />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ RITUAL — connected timeline with active glow ═══ */}
      <section id="ritual" ref={ritualContainer} className="section relative" style={{ zIndex: 1 }}>
        <div className="px-6 lg:px-12">
          <AnimatedSection>
            <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-4 inline-block">Ritual</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-12">Ciencia & rutina en tres movimientos</h2>
          </AnimatedSection>

          <div className="max-w-2xl space-y-8 lg:space-y-12">
            {rituals.map((s, i) => (
              <div key={i} className="ritual-observe" data-index={i}>
                <RitualStep step={s} index={i} activeIndex={activeRitual} />
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-3 mt-12">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-[2px] transition-all duration-700 ${activeRitual >= i ? 'bg-gold/40' : 'bg-navy/5'}`}
                style={{ flex: activeRitual === i ? '2' : '1' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — overlapping glass panel ═══ */}
      <section className="section relative" style={{ zIndex: 1 }}>
        <div className="px-6 lg:px-12">
          <AnimatedSection>
            <div className="spotlight p-12 lg:p-24 text-center relative overflow-hidden">
              <div className="absolute top-[-50%] left-[-5%] w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px]" />
              <div className="relative z-10 max-w-xl mx-auto">
                <span className="bg-navy/5 text-navy/60 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 mb-5 inline-block">Comienza Hoy</span>
                <KineticText text="Tu cabello, tu regla" className="font-display font-bold text-3xl lg:text-4xl text-navy tracking-tight mb-4" />
                <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">Únete a miles de hombres que ya dominan su look con DASHU.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.button onClick={() => addItem(PRODUCT, 1)} className="btn-primary"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
