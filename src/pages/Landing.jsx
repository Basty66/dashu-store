import { useEffect, useRef, useState, useCallback } from 'react'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import { useCart } from '../context/CartContext'

const PRODUCT = {
  id: 1,
  name: 'Protein Down Cream',
  size: '120 ml',
  description: 'Crema hidratante facial con proteínas de rápida absorción. Formulada para la piel masculina, con péptidos revitalizantes y una textura ultraligera que no deja residuos.',
  price: 24990,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const steps = [
  { icon: 'Droplet', number: '01', title: 'Preparar', desc: 'Limpia tu rostro con tu limpiador habitual y seca con movimientos suaves.' },
  { icon: 'Circle', number: '02', title: 'Aplicar', desc: 'Toma una cantidad moderada de Protein Down Cream y distribúyela en tu rostro.' },
  { icon: 'Sparkles', number: '03', title: 'Absorber', desc: 'Masajea con movimientos ascendentes hasta su total absorción. Úsalo mañana y noche.' },
]

const benefits = [
  { icon: 'Hidratación 24h', desc: 'Hidratación profunda y duradera que mantiene tu piel equilibrada todo el día.' },
  { icon: 'Textura Ligera', desc: 'Fórmula no grasa de absorción inmediata. Ideal para uso diario.' },
  { icon: 'Con Péptidos', desc: 'Enriquecido con péptidos y proteínas que fortalecen la barrera cutánea.' },
  { icon: 'Resultados Rápidos', desc: 'Piel visiblemente más suave, tersa y revitalizada en solo 7 días.' },
]

function useScrollReveal() {
  const ref = useRef([])
  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    el.forEach(e => e && observer.observe(e))
    return () => el.forEach(e => e && observer.unobserve(e))
  }, [])
  return ref
}

function StepIcon({ name }) {
  const icons = {
    Droplet: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    Circle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    Sparkles: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4m0 10v4m-9-9h4m10 0h4M5.64 5.64l2.83 2.83m7.07 7.07l2.83 2.83M5.64 18.36l2.83-2.83m7.07-7.07l2.83-2.83"/></svg>,
  }
  return icons[name] || null
}

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const revealRefs = useScrollReveal()

  const setRef = useCallback((el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }, [revealRefs])

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center relative px-6 lg:px-10 pt-28 pb-16 lg:pb-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-8%] w-[600px] h-[600px] bg-sand/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-charcoal/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
          <div className="animate-fade-up" style={{ animationDuration: '1s' }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-charcoal/5 text-charcoal/70 text-[11px] font-medium tracking-wider uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-sand" />
              Nuevo — Disponible en Chile
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-charcoal leading-[0.92] tracking-[-0.03em] mb-6">
              Korean<br />
              <span className="text-sand">Protein Down</span><br />
              Cream
            </h1>

            <p className="font-body text-[15px] text-slate leading-relaxed max-w-md mb-8">
              {PRODUCT.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {['Hidratación 24h', 'Textura ligera', 'Con péptidos', 'Todo tipo de piel'].map((b, i) => (
                <span key={i} className="px-3.5 py-1.5 rounded-full bg-white border border-black/5 text-xs text-stone/70 font-medium">
                  {b}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-8 mb-8">
              <div>
                <p className="font-display font-bold text-4xl text-charcoal tracking-tight">
                  ${PRODUCT.price.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-slate mt-1">IVA incluido · {PRODUCT.size}</p>
              </div>
              <div className="flex items-center border border-black/10 rounded-full overflow-hidden bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-black/5 transition-colors text-stone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="w-12 text-center font-display font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-black/5 transition-colors text-stone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => addItem(PRODUCT, qty)} className="btn-primary">
                Agregar al Carrito
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>
              <a href="#como-usar" className="btn-secondary">
                Cómo Usarlo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="animate-fade-up flex justify-center lg:justify-end" style={{ animationDuration: '1s', animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sand/10 to-charcoal/5 rounded-[40px] blur-3xl" />
              <div className="card-premium p-8 relative">
                <img
                  src={PRODUCT.image}
                  alt="DASHU Protein Down Cream"
                  className="w-full max-w-md h-auto object-contain drop-shadow-2xl hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-sand/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS STRIP ─── */}
      <section className="px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/5 rounded-2xl overflow-hidden">
            {benefits.map((b, i) => (
              <div key={i} ref={setRef} className="reveal reveal-delay-1 bg-ivory px-6 py-10 text-center">
                <p className="font-display font-semibold text-sm text-charcoal mb-2">{b.icon}</p>
                <p className="font-body text-xs text-slate leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="section" ref={setRef}>
        <div className="container-premium">
          <div className="text-center mb-14 reveal">
            <span className="badge bg-charcoal/5 text-charcoal/70 text-[11px] uppercase tracking-widest mb-5">Resultados Reales</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal tracking-tight mb-4">
              Antes y Después
            </h2>
            <p className="font-body text-slate text-sm max-w-lg mx-auto">
              Resultados visibles desde la primera semana de uso continuo.
            </p>
          </div>
          <div ref={setRef} className="reveal">
            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* ─── CÓMO USAR ─── */}
      <section id="como-usar" className="section bg-charcoal relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-15%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="container-premium relative z-10">
          <div className="text-center mb-16">
            <span className="badge bg-white/10 text-white/60 text-[11px] uppercase tracking-widest mb-5">Rutina</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
              Cómo Usarlo
            </h2>
            <p className="font-body text-white/40 text-sm max-w-lg mx-auto">
              Tres pasos simples para integrar Protein Down Cream a tu rutina diaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={setRef}
                className="reveal reveal-delay-2 group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500"
              >
                <span className="font-display font-bold text-5xl text-white/[0.06] absolute top-4 right-6 leading-none">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sand mb-6 group-hover:bg-white/15 transition-all duration-500">
                  <StepIcon name={step.icon} />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-3">{step.title}</h3>
                <p className="font-body text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="section bg-ivory" ref={setRef}>
        <div className="container-premium">
          <div className="card-elevated p-12 lg:p-20 text-center relative overflow-hidden reveal">
            <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-sand/5 rounded-full blur-[100px]" />
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="badge bg-charcoal/5 text-charcoal/70 text-[11px] uppercase tracking-widest mb-5">
                Comienza Hoy
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal tracking-tight mb-4">
                Tu Piel Merece lo Mejor
              </h2>
              <p className="font-body text-slate text-sm mb-10 max-w-md mx-auto">
                Únete a cientos de hombres que ya transformaron su rutina de grooming con DASHU.
              </p>
              <button
                onClick={() => addItem(PRODUCT, 1)}
                className="btn-primary text-sm"
              >
                Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
