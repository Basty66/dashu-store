import { useEffect, useRef, useCallback, useState } from 'react'
import { useCart } from '../context/CartContext'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

const PRODUCT = {
  id: 1,
  name: 'Protein Down Cream',
  size: '120 ml',
  description: 'Crema hidratante facial con proteínas de rápida absorción. Formulada para la piel masculina, con péptidos revitalizantes y una textura ultraligera que no deja residuos.',
  price: 24990,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const revealRefs = useRef([])

  useEffect(() => {
    const els = revealRefs.current
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(e => e && observer.observe(e))
    return () => els.forEach(e => e && observer.unobserve(e))
  }, [])

  const setRef = useCallback((el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }, [])

  return (
    <div className="overflow-hidden">
      {/* ─── HERO — editorial split ─── */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left — visual */}
        <div className="bg-soot relative flex items-center justify-center min-h-[50vh] lg:min-h-screen order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-soot via-soot to-pitch" />
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-clay/5 rounded-full blur-[120px]" />
          <div className={`relative z-10 p-12 lg:p-20 transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <img
              src={PRODUCT.image}
              alt="DASHU Protein Down Cream"
              onLoad={() => setHeroLoaded(true)}
              className="w-full max-w-md mx-auto drop-shadow-2xl float-product"
            />
          </div>
          <div className="absolute bottom-10 left-12 hidden lg:block">
            <p className="text-white/20 text-[11px] tracking-[0.2em] uppercase">Corea · 2024</p>
          </div>
        </div>

        {/* Right — content */}
        <div className="flex items-center px-8 lg:px-16 py-20 lg:py-0 order-1 lg:order-2 bg-parchment">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-10">
              <span className="badge bg-soot text-parchment">Nuevo</span>
              <span className="text-stone text-xs tracking-widest uppercase">Disponible en Chile</span>
            </div>

            <h1 className="font-display font-extrabold text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.88] tracking-[-0.04em] text-soot mb-2">
              Protein Down
            </h1>
            <h1 className="font-display font-extrabold text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.88] tracking-[-0.04em] text-clay mb-6">
              Cream
            </h1>

            <p className="text-sm text-stone leading-relaxed max-w-sm mb-10">
              Cuidado facial premium con proteínas de rápida absorción. Textura ultraligera que no deja residuos. Resultados visibles en 7 días.
            </p>

            <div className="flex items-center gap-8 mb-10">
              <div>
                <p className="font-display font-bold text-4xl text-soot tracking-tight">${PRODUCT.price.toLocaleString('es-CL')}</p>
                <p className="text-xs text-stone/70 mt-1">{PRODUCT.size} · IVA incluido</p>
              </div>
              <div className="flex items-center border border-soot/10 bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-smudge transition-colors text-stone">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="w-10 text-center font-display font-semibold text-sm text-soot">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-smudge transition-colors text-stone">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => addItem(PRODUCT, qty)} className="btn-primary">
                Agregar al Carrito
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </button>
              <a href="#como-usar" className="btn-outline">
                Cómo Usarlo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-6 mt-14 pt-8 border-t border-soot/5">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-linen border-2 border-parchment flex items-center justify-center text-[10px] font-bold text-stone">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone/60">+150 hombres ya lo usan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS — editorial grid ─── */}
      <section className="section bg-parchment" ref={setRef}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div className="reveal max-w-lg">
              <span className="badge bg-soot/5 text-soot/60 mb-4">Beneficios</span>
              <h2 className="heading-lg text-soot">Ciencia coreana para tu piel</h2>
            </div>
            <p className="reveal reveal-d1 text-sm text-stone max-w-xs leading-relaxed">
              Formulado con ingredientes de última generación para el hombre que exige resultados sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-soot/5">
            {[
              { t: 'Hidratación 24h', d: 'Mantiene tu piel equilibrada desde la mañana hasta la noche.' },
              { t: 'Textura Ligera', d: 'Absorción inmediata. Sin sensación grasa. Ideal para uso diario.' },
              { t: 'Con Péptidos', d: 'Fortalecen la barrera cutánea y estimulan la regeneración celular.' },
              { t: 'Resultados Rápidos', d: 'Piel más suave, tersa y revitalizada en solo 7 días.' },
            ].map((b, i) => (
              <div key={i} ref={setRef} className={`reveal reveal-d${i+1} bg-white p-8 lg:p-10`}>
                <span className="text-[11px] font-display font-semibold tracking-[0.15em] uppercase text-clay mb-3 block">0{i+1}</span>
                <h3 className="font-display font-semibold text-sm text-soot mb-2">{b.t}</h3>
                <p className="text-xs text-stone leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="section bg-linen" ref={setRef}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div className="reveal">
              <span className="badge bg-soot/5 text-soot/60 mb-4">Resultados</span>
              <h2 className="heading-lg text-soot">Antes y Después</h2>
            </div>
            <p className="reveal reveal-d1 text-sm text-stone max-w-xs leading-relaxed">
              Resultados visibles desde la primera semana de uso continuo. Piel más saludable en cada aplicación.
            </p>
          </div>
          <div ref={setRef} className="reveal reveal-d1 max-w-4xl mx-auto">
            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* ─── CÓMO USAR — dark editorial ─── */}
      <section id="como-usar" className="section bg-soot relative overflow-hidden" ref={setRef}>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="badge bg-white/5 text-white/40 mb-4">Rutina</span>
            <h2 className="heading-lg text-white">Tres pasos, una rutina</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
            {[
              { n: '01', t: 'Preparar', d: 'Limpia tu rostro con tu limpiador habitual. Seca con movimientos suaves sin frotar.' },
              { n: '02', t: 'Aplicar', d: 'Toma una cantidad moderada de Protein Down Cream y distribúyela uniformemente.' },
              { n: '03', t: 'Absorber', d: 'Masajea con movimientos ascendentes hasta total absorción. Usa mañana y noche.' },
            ].map((s, i) => (
              <div key={i} ref={setRef} className={`reveal reveal-d${i+1} group relative`}>
                <div className="p-8 lg:p-10 border md:border-none border-white/[0.06]">
                  <span className="font-display font-bold text-7xl lg:text-8xl text-white/[0.04] absolute top-4 right-6 leading-none select-none">
                    {s.n}
                  </span>
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center mb-8 group-hover:bg-clay/20 transition-colors duration-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      {i === 0 ? <><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></> :
                       i === 1 ? <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> :
                       <><path d="M12 3v4m0 10v4m-9-9h4m10 0h4M5.64 5.64l2.83 2.83m7.07 7.07l2.83 2.83M5.64 18.36l2.83-2.83m7.07-7.07l2.83-2.83"/></>}
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-3">{s.t}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section bg-parchment" ref={setRef}>
        <div className="max-w-[1400px] mx-auto">
          <div className="reveal bg-white border border-soot/5 p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] bg-clay/5 rounded-full blur-[100px]" />
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="badge bg-soot/5 text-soot/60 mb-4">Comienza Hoy</span>
              <h2 className="heading-lg text-soot mb-4">Tu piel merece lo mejor</h2>
              <p className="text-sm text-stone mb-10 max-w-md mx-auto leading-relaxed">
                Únete a cientos de hombres que ya transformaron su rutina de grooming con DASHU.
              </p>
              <button onClick={() => addItem(PRODUCT, 1)} className="btn-primary mx-auto">
                Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
