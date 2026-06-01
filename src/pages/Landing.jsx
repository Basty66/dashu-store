import { useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import { useCart } from '../context/CartContext'

const P_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

const ITEM = { id: 1, name: 'Protein Down Cream', price: 14000, image: P_IMG }

export default function Landing() {
  const { addItem, totalItems } = useCart()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const steps = [
    { num: '01', title: 'Aplica en cabello húmedo', desc: 'Distribuye uniformemente de medios a puntas, como un styling diario' },
    { num: '02', title: 'Peina hacia la dirección deseada', desc: 'Define el flujo del cabello para que el producto lo fije naturalmente' },
    { num: '03', title: 'Espera 3-5 min. Sin calor, sin secador', desc: 'Deja que la keratina actúe. Se fija solo, sin dañar tu cabello' },
  ]

  const benefits = [
    { icon: '🛡', title: 'Protección Térmica', desc: 'Escudo contra el calor y la humedad. Ideal para uso diario.' },
    { icon: '💪', title: 'Fijación Natural', desc: 'Mantiene la forma sin rigidez ni residuos.' },
    { icon: '🌿', title: 'Keratina Vegetal', desc: 'Fortalece la fibra capilar desde el primer uso.' },
    { icon: '🚿', title: 'Fácil de Lavar', desc: 'Se va con un solo lavado. Sin acumulación.' },
  ]

  return (
    <div style={{ background: '#fff8f5' }}>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="w-full">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 glass text-xs px-4 py-2 rounded-full tracking-wider uppercase font-semibold" style={{ color: '#755841' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#755841' }} />
                Nuevo
              </div>
              <h1 className="display-xl leading-[0.95]" style={{ color: '#0F2038' }}>
                <span className="block">RE-DEFINE</span>
                <span className="block text-[1.4em] mt-[-0.08em]">TU</span>
                <span className="block mt-[-0.08em]">LOOK</span>
              </h1>
              <p className="text-base max-w-md" style={{ color: '#44474d', fontFamily: 'Inter, sans-serif' }}>
                Protein Down Cream. Pecera coreana de keratina vegetal. Sin calor, sin daño, sin complicaciones.
              </p>
              <motion.button onClick={() => addItem(ITEM)}
                className="btn-primary inline-flex items-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span className="relative z-10 flex items-center gap-2">
                  Comprar Agora · $14.000
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </motion.button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="spotlight absolute inset-0 rounded-2xl" />
                <div className="glass rounded-2xl p-6 w-full h-full flex items-center justify-center relative z-10">
                  <motion.img src={P_IMG} alt="Protein Down Cream" className="w-full h-full object-contain drop-shadow-2xl"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase" style={{ color: '#75777e' }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#75777e" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </motion.div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="text-center mb-12">
            <span className="label text-xs" style={{ color: '#755841' }}>Resultados Reales</span>
            <h2 className="h-lg text-3xl mt-2" style={{ color: '#0F2038' }}>Antes y Después</h2>
          </div>
          <BeforeAfterSlider />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24" style={{ background: '#0F2038' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="text-center mb-16">
            <span className="label text-xs text-gold/70">Por qué DASHU</span>
            <h2 className="h-lg text-3xl text-white mt-2">Beneficios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-2xl block">{b.icon}</span>
                <h3 className="h-sm text-white">{b.title}</h3>
                <p className="text-sm text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section id="como-usar" className="py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="text-center mb-16">
            <span className="label text-xs" style={{ color: '#755841' }}>Guía Rápida</span>
            <h2 className="h-lg text-3xl mt-2" style={{ color: '#0F2038' }}>Cómo Usar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative glass-card p-8 space-y-4">
                <span className="display-sm text-gold block">{s.num}</span>
                <h3 className="h-sm text-navy">{s.title}</h3>
                <p className="text-sm" style={{ color: '#44474d', fontFamily: 'Inter, sans-serif' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden" style={{ background: '#0F2038' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #755841 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #755841 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 text-center relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="display-md text-white mb-6">
            Listo para re-definir tu look?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-white/60 mb-10 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sin calor. Sin daño. Solo keratina vegetal que transforma tu cabello al instante.
          </motion.p>
          <motion.button onClick={() => addItem(ITEM)}
            className="btn-secondary inline-flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Comprar Ahora · $14.000
          </motion.button>
        </div>
      </section>
    </div>
  )
}
