import { useEffect, useRef, useState } from 'react'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import { useCart } from '../context/CartContext'

const PRODUCT = {
  id: 1,
  name: 'Protein Down Cream',
  description: 'Crema hidratante con proteínas para el cuidado facial masculino. Textura ligera de rápida absorción.',
  price: 24990,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
}

const steps = [
  { icon: 'cleaning_services', title: 'Preparar', desc: 'Limpia tu rostro con tu limpiador habitual y seca suavemente.' },
  { icon: 'schedule', title: 'Esperar', desc: 'Aplica una cantidad moderada de Protein Down Cream en tu rostro.' },
  { icon: 'water_drop', title: 'Hidratar', desc: 'Masajea suavemente hasta su total absorción. Úsalo mañana y noche.' },
]

const benefits = [
  'Hidratación profunda 24h',
  'Textura ligera no grasa',
  'Con péptidos y proteínas',
  'Para todo tipo de piel',
  'Resultados visibles en 7 días',
]

export default function Landing() {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const sectionsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionsRef.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const addToCart = (el) => {
    if (!sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-navy/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brown/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-navy/10 text-navy text-xs font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>4.9/5 — 200+ reseñas</span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-navy leading-tight mb-4">
              Korean<br />
              <span className="text-brown">Protein Down</span><br />
              Cream
            </h1>

            <p className="font-body text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              {PRODUCT.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {benefits.map((b, i) => (
                <span key={i} className="flex items-center gap-1 text-xs font-medium text-navy bg-white/60 px-3 py-1.5 rounded-full glass-card">
                  <span className="material-symbols-outlined text-sm">check</span>
                  {b}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="text-left">
                <p className="text-3xl sm:text-4xl font-display font-bold text-navy">
                  ${PRODUCT.price.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-gray-400">+ gastos de envío</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-10 text-center font-medium text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => addItem(PRODUCT, qty)}
                className="btn-primary"
              >
                Comprar Ahora
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
              </button>
              <a href="#como-usar" className="btn-secondary">
                Ver Detalles
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-brown/10 rounded-[40px] blur-2xl" />
              <div className="glass-card p-6 relative">
                <img
                  src={PRODUCT.image}
                  alt="DASHU Protein Down Cream"
                  className="w-full max-w-md h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* Cómo Usar */}
      <section id="como-usar" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy mb-3">Cómo Usar</h2>
            <p className="font-body text-gray-500 max-w-md mx-auto">
              3 simples pasos para una rutina de grooming efectiva
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={el => addToCart(el)}
                className="fade-in-section glass-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl text-navy">{step.icon}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-display font-semibold text-xl text-navy mb-3">{step.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Listo para Transformar tu Piel
          </h2>
          <p className="font-body text-white/60 mb-8 max-w-md mx-auto">
            Únete a cientos de hombres que ya confían en DASHU para su rutina de cuidado facial.
          </p>
          <button
            onClick={() => addItem(PRODUCT, 1)}
            className="inline-flex items-center gap-2 bg-white text-navy font-display font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all hover:shadow-xl"
          >
            Comprar Ahora — ${PRODUCT.price.toLocaleString('es-CL')}
          </button>
        </div>
      </section>
    </div>
  )
}
