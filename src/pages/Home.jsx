import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { clp } from '../lib/format'
import { Shield, Zap, Leaf, Droplets, ArrowRight, ChevronDown, Star, MessageSquare, ExternalLink } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

const P_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA'

const ITEM = { id: 1, name: 'Protein Down Cream', price: 14, image: P_IMG }

const steps = [
  { num: '01', title: 'Aplica en cabello seco', desc: 'Con el cepillo, aplica desde la raíz cubriendo el área lateral que quieres domar. El pelo rebelde se impregna con la fórmula coreana.' },
  { num: '02', title: 'Espera 10 minutos', desc: 'El Cysteamine de bajo peso molecular penetra la fibra capilar. Sin calor, sin olor químico intenso. Solo una suave fragancia.' },
  { num: '03', title: 'Lava, seca y peina', desc: 'Enjuaga con shampoo, seca y peina normalmente. Tu cabello lateral queda liso, disciplinado y con brillo natural.' },
]

const benefits = [
  { icon: Shield, title: 'Tecnología Cysteamine', desc: 'Molécula de bajo peso molecular que penetra profundo en la fibra capilar. Alisa el pelo rebelde tipo erizo sin dañar.' },
  { icon: Zap, title: 'Resultado en 10 Minutos', desc: 'Aplicación rápida en casa. Sin plancha, sin calor extremo. Resultado profesional de barbería en minutos.' },
  { icon: Leaf, title: 'Proteína de Seda + Arroz', desc: 'Nanotecnología coreana con aminoácidos de seda y proteína de arroz. Nutre y fortalece mientras alisa.' },
  { icon: Droplets, title: 'Dura 3 a 4 Semanas', desc: 'Una sola aplicación mantiene el pelo lateral liso y disciplinado por semanas. Lavable, sin rigidez.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

const heroLetterVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -40 },
  visible: (i) => ({ opacity: 1, y: 0, rotateX: 0, transition: { delay: i * 0.04, duration: 0.4, ease: [0.4, 0, 0.2, 1] } }),
}

function HeroText({ text }) {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', perspective: '800px' }}>
      {text.split('').map((char, i) => (
        <motion.span key={i} custom={i} variants={heroLetterVariants} initial="hidden" animate="visible"
          style={char === ' ' ? { width: '0.35em' } : {}}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function Home() {
  const { addItem, totalItems } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.comment.trim()) return
    setSubmitting(true)
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: form.customerName.trim(), rating: form.rating, comment: form.comment.trim() }),
    })
      .then(r => r.json())
      .then(() => { setSubmitted(true); setForm({ customerName: '', rating: 5, comment: '' }) })
      .catch(() => {})
      .finally(() => setSubmitting(false))
  }

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const productRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [8, -8]), { stiffness: 120, damping: 15 })
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), { stiffness: 120, damping: 15 })
  const glowX = useSpring(useTransform(mouseX, [-1, 1], [-15, 15]), { stiffness: 100, damping: 20 })
  const glowY = useSpring(useTransform(mouseY, [-1, 1], [-15, 15]), { stiffness: 100, damping: 20 })
  const productTransform = useTransform([rotateX, rotateY], ([rx, ry]) => `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`)

  useEffect(() => {
    const el = productRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = Math.min(Math.max((e.clientX - cx) / (rect.width / 2), -1), 1)
      const dy = Math.min(Math.max((e.clientY - cy) / (rect.height / 2), -1), 1)
      mouseX.set(dx)
      mouseY.set(dy)
    }
    const onLeave = () => { mouseX.set(0); mouseY.set(0) }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div>
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden light-ambient">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute -top-48 -right-48 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full opacity-[0.04] bg-navy"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="w-full">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}
                className="inline-flex items-center gap-2 glass text-xs px-4 py-2 rounded-full tracking-wider uppercase font-semibold text-gold">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-gold"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                K-Beauty · Alisado Coreano
              </motion.div>
              <h1 className="display-xl text-navy leading-[0.95]">
                <HeroText text="RE-DEFINE" />
                <span className="block text-[1.4em] mt-[-0.08em]"><HeroText text="TU" /></span>
                <span className="block mt-[-0.08em]"><HeroText text="LOOK" /></span>
              </h1>
              <motion.p variants={itemVariants} className="text-base max-w-md text-stone">
                Protein Down Cream de DASHU Korea. Alisado coreano con Cysteamine y proteína de seda. Domina el pelo rebelde en 10 min.
              </motion.p>
              <motion.div variants={itemVariants}>
                <motion.button onClick={e => addItem(ITEM, e.currentTarget.getBoundingClientRect())}
                  className="btn-primary inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Comprar Ahora · {clp(ITEM.price)}
                  <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            </motion.div>
                    <motion.div ref={productRef} className="relative flex items-center justify-center"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="relative w-full max-w-md">
                <motion.div className="aspect-square"
                  style={{ transform: productTransform, transformStyle: 'preserve-3d' }}>
                  <motion.div className="spotlight absolute inset-0 rounded-2xl"
                    style={{ x: glowX, y: glowY }} />
                  <div className="glass rounded-2xl p-6 w-full h-full absolute inset-0 flex items-center justify-center z-10"
                    style={{ boxShadow: '0 24px 64px rgba(15,32,56,0.18)' }}>
                    <motion.img src="/product-hero.png" alt="Protein Down Cream"
                      className="w-full h-full object-contain"
                      style={{ filter: 'drop-shadow(0 16px 32px rgba(15,32,56,0.28))' }}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      onError={e => { e.target.src = P_IMG }} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <span className="text-xs tracking-widest uppercase text-outline-v">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={16} className="text-outline-v" />
          </motion.div>
        </motion.div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Catálogo</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Nuestros Productos</h2>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="skeleton h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-8 w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-stone mb-2">No hay productos disponibles aún.</p>
              <p className="text-xs text-outline-v">Agrega productos desde el panel de administración.</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
              {products.map(p => (
                <motion.div key={p.id} variants={itemVariants}><ProductCard product={p} /></motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden glow-hover" style={{ background: '#0F2038' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-[0.04] bg-cream"
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-[0.04] bg-gold"
            animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold/70">Tecnología Coreana</span>
            <h2 className="h-lg text-3xl text-white mt-2">Beneficios</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
            {benefits.map((b) => (
              <motion.div key={b.title} variants={itemVariants}
                className="glass-card p-6 text-center space-y-3 group" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}>
                  <b.icon size={28} strokeWidth={1.2} className="mx-auto text-gold/80" />
                </motion.div>
                <h3 className="h-sm text-white">{b.title}</h3>
                <p className="text-sm text-white/60">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="como-usar" className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Guía Rápida</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Cómo Usar</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
            {steps.map((s) => (
              <motion.div key={s.num} variants={itemVariants}
                className="glass-card p-8 space-y-4 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 text-[80px] font-black text-navy/[0.03] group-hover:text-navy/[0.06] transition-colors duration-500 select-none">
                  {s.num}
                </div>
                <span className="display-sm text-gold block relative z-10">{s.num}</span>
                <h3 className="h-sm text-navy relative z-10">{s.title}</h3>
                <p className="text-sm text-stone relative z-10">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-[0.03] bg-navy"
            animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Resultados</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Antes y Después</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl overflow-hidden border border-red-200/30 group transition-shadow duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-cream/80 overflow-hidden">
                <motion.img src="/antes.png" alt="Antes del alisado coreano" className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }}
                  onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                <h3 className="h-md text-navy text-lg">Antes</h3>
                <ul className="text-sm text-stone space-y-2 text-left">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Pelo lateral rebelde tipo erizo</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Volumen excesivo en los costados</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Dificultad para peinar y mantener estilo</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Se levanta con la humedad o el viento</li>
                </ul>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl overflow-hidden border border-green-200/30 group transition-shadow duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] bg-cream/80 overflow-hidden">
                <motion.img src="/despues.png" alt="Después del alisado coreano" className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }}
                  onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="h-md text-navy text-lg">Después</h3>
                <ul className="text-sm text-stone space-y-2 text-left">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Pelo lateral liso y disciplinado</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Volumen controlado, perfil definido</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Peinado rápido sin esfuerzo</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Resultado duradero por 3-4 semanas</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full opacity-[0.03] bg-gold"
            animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Recomendado por</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Barberos Profesionales</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-lg mx-auto">
            <motion.div whileHover={{ y: -4 }}
              className="glass-card p-8 text-center space-y-4 group transition-shadow duration-300 hover:shadow-xl">
              <motion.div className="w-20 h-20 rounded-full bg-navy/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#755841" strokeWidth="1.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </motion.div>
              <div className="space-y-1">
                <h3 className="h-sm text-navy">Tomás Morales</h3>
                <p className="text-xs text-outline-v">Barbero Profesional · Profesor Emprende Melipilla</p>
              </div>
              <p className="text-sm text-stone italic leading-relaxed">
                "Como barbero y profesor, recomiendo Protein Down Cream para domar el pelo lateral rebelde. Resultado rápido, sin calor y dura semanas. Ideal para mis alumnos y clientes."
              </p>
              <div className="flex items-center justify-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <motion.svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                    initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </motion.svg>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: '#f8f6f4' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-10 right-20 w-80 h-80 rounded-full opacity-[0.03] bg-navy"
            animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-10 left-20 w-60 h-60 rounded-full opacity-[0.03] bg-gold"
            animate={{ scale: [1, 1.25, 1], opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Clientes</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Reseñas</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
            {reviews.length === 0 ? (
              <motion.div variants={itemVariants} className="md:col-span-2 text-center py-12">
                <MessageSquare size={32} className="mx-auto text-outline-v mb-3" />
                <p className="text-sm text-stone">Sé el primero en dejar una reseña</p>
              </motion.div>
            ) : (
              reviews.map(r => (
                <motion.div key={r.id} variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="glass rounded-xl p-6 space-y-3 group transition-shadow duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy shrink-0"
                      whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                      {r.customerName.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-navy">{r.customerName}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < r.rating ? '#755841' : '#d4cfcc'}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-stone leading-relaxed">{r.comment}</p>
                  <p className="text-[11px] text-outline-v">{new Date(r.createdAt).toLocaleDateString('es-CL')}</p>
                </motion.div>
              ))
            )}
          </motion.div>
          <motion.div className="max-w-lg mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div whileHover={{ y: -2 }}
              className="glass rounded-xl p-6 md:p-8 transition-shadow duration-300 hover:shadow-xl">
              <h3 className="h-sm text-navy mb-4 text-center">Deja tu Reseña</h3>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </motion.div>
                  <p className="text-sm text-stone">Gracias por tu reseña. Será publicada después de ser revisada.</p>
                  <button onClick={() => setSubmitted(false)} className="text-xs text-gold underline hover:no-underline transition-all">Enviar otra</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
                    <input type="text" placeholder="Tu nombre" value={form.customerName}
                      onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm text-navy placeholder:text-outline-v focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300" required />
                  </motion.div>
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                    <span className="text-xs text-stone">Tu puntuación:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                          className="p-1 transition-all hover:scale-125 duration-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={n <= form.rating ? '#755841' : '#d4cfcc'}
                            className="transition-all duration-200" style={{ filter: n <= form.rating ? 'drop-shadow(0 0 2px rgba(117,88,65,0.3))' : 'none' }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
                    <textarea placeholder="Escribe tu reseña..." value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm text-navy placeholder:text-outline-v focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 resize-none h-24" required />
                  </motion.div>
                  <motion.button type="submit" disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {submitting ? 'Enviando...' : 'Enviar Reseña'} <ArrowRight size={14} />
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-[0.03] bg-navy"
            animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10">
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label text-xs text-gold">Google</span>
            <h2 className="h-lg text-3xl text-navy mt-2">Reseñas de Google</h2>
          </motion.div>
          <motion.div className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div whileHover={{ y: -4 }}
              className="glass-card p-8 space-y-4 group transition-shadow duration-300 hover:shadow-xl">
              <motion.div className="flex items-center justify-center gap-1 text-gold"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ staggerChildren: 0.08 }}>
                {[...Array(5)].map((_, i) => (
                  <motion.svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
                    initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </motion.svg>
                ))}
              </motion.div>
              <p className="text-sm text-stone">¿Te gustó el producto? Ayuda a otros clientes dejando tu opinión en Google.</p>
              <a href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID" target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-sm group"
                style={{ position: 'relative', overflow: 'hidden' }}>
                <motion.span className="relative z-10" whileHover={{ x: 2 }}>Escribir en Google</motion.span>
                <ExternalLink size={14} className="relative z-10" />
              </a>
              <p className="text-[11px] text-outline-v">Tu reseña en Google ayuda a más personas a descubrir DASHU.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32 relative overflow-hidden glow-navy" style={{ background: '#0F2038' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #755841 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #755841 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 text-center relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="display-md text-white mb-6">
            Listo para re-definir tu look?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-white/60 mb-10 max-w-lg mx-auto">
            Con Cysteamine de bajo peso molecular, proteína de seda nano-liposoma y aceite de baobab. Hecho en Corea.
          </motion.p>
          <motion.button onClick={e => addItem(ITEM, e.currentTarget.getBoundingClientRect())}
            className="btn-secondary inline-flex items-center gap-2 mx-auto"
            style={{ color: '#fff8f5', borderColor: 'rgba(255,248,245,0.3)' }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,248,245,0.6)' }} whileTap={{ scale: 0.98 }}>
            Comprar Ahora · {clp(ITEM.price)} <ArrowRight size={14} />
          </motion.button>
        </div>
      </section>
    </div>
  )
}
