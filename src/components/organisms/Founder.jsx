import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Scissors, MapPin, GraduationCap, ChevronDown } from 'lucide-react'
import { FOUNDER } from '@shared/store.js'
import { Button } from '../atoms/Button'
import { Eyebrow } from '../atoms/Misc'

const ease = [0.16, 1, 0.3, 1]

function Portrait() {
  const initials = FOUNDER.name.split(' ').map((w) => w[0]).join('')
  return (
    // En celular es una tarjeta apaisada (no ocupa una pantalla entera); en escritorio, vertical.
    <div className="grain relative aspect-[16/11] overflow-hidden rounded-3xl bg-ink sm:aspect-[4/5] sm:rounded-4xl">
      {FOUNDER.photo ? (
        <img src={FOUNDER.photo} alt={FOUNDER.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full flex-col justify-between p-6 text-paper sm:p-8">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blush/15 blur-3xl" />
          <p className="eyebrow relative text-gold">Imperio Barber · {FOUNDER.city}</p>
          <p className="relative font-display font-black leading-none text-blush" style={{ fontSize: 'clamp(4.5rem, 16vw, 12rem)', fontStretch: '125%' }} aria-hidden="true">{initials}</p>
          <div className="relative">
            <p className="font-display text-xl font-bold sm:text-2xl">{FOUNDER.name}</p>
            <p className="text-sm text-paper/60">{FOUNDER.role}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// "Quién soy": la historia de Tomás Morales (texto entregado por el negocio).
export function Founder() {
  const [expanded, setExpanded] = useState(false)
  const facts = [
    { icon: Scissors, value: `${FOUNDER.yearsInBarbering} años`, label: 'en la barbería' },
    { icon: MapPin, value: FOUNDER.city, label: 'Imperio Barber' },
    { icon: GraduationCap, value: 'Educador', label: 'seminarios y clases' },
  ]
  return (
    <section id="quien-soy" className="bg-blush-light py-14 sm:py-20 lg:py-28">
      <div className="container-x grid items-center gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-16">
        <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease }}>
          <Portrait />
        </motion.div>
        <motion.div className="lg:col-span-7" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease, delay: 0.1 }}>
          <Eyebrow>Quién soy</Eyebrow>
          <h2 className="display-lg mt-3">
            Mi pasión por la barbería, hoy convertida en una{' '}
            <span className="font-serif font-normal italic text-gold-deep" style={{ fontStretch: '100%' }}>nueva forma</span> de cuidar el cabello masculino.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/75 sm:mt-8 sm:text-[1.05rem]">
            <p>
              Soy <strong className="text-ink">{FOUNDER.name}</strong>, barbero educador y fundador de Imperio Barber, en {FOUNDER.city}, Chile. Durante {FOUNDER.yearsInBarbering} años la barbería fue mi pasión, lo que me llevó a dejar mi trabajo para dedicarme completamente a lo que realmente me apasionaba: transformar la imagen masculina.
            </p>
            {/* En celular el resto de la historia se despliega con "Leer mi historia". */}
            <div className={`grid transition-[grid-template-rows] duration-500 ease-out lg:grid-rows-[1fr] ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="space-y-4 overflow-hidden">
                <p>
                  A través de mi experiencia profesional descubrí que muchos hombres enfrentan problemas con su cabello y no encuentran soluciones prácticas para controlarlo y darle la forma que desean.
                </p>
                <p>
                  Por eso decidí traer a Chile productos innovadores como <strong className="text-ink">DASHU Down Permanent</strong>, una solución capilar coreana que estoy dando a conocer e impulsando en el mercado masculino, acercando nuevas alternativas de cuidado y estilizado a más hombres y profesionales.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1.5 py-1 text-sm font-medium text-gold-deep underline decoration-gold/50 underline-offset-4 lg:hidden"
            >
              {expanded ? 'Leer menos' : 'Leer mi historia'}
              <ChevronDown size={15} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>
          <blockquote className="mt-6 border-l-2 sm:mt-8 border-gold pl-5 font-display text-xl font-bold leading-snug sm:text-2xl" style={{ fontStretch: '108%' }}>
            Mi propósito es claro: ayudar a los hombres a dominar su cabello, potenciar su estilo y sentirse seguros con su imagen.
            <span className="mt-2 block font-serif text-lg font-normal italic text-gold-deep" style={{ fontStretch: '100%' }}>Esto es solo el comienzo.</span>
          </blockquote>
          <dl className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {facts.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-3xl bg-paper p-4 sm:p-5">
                <Icon size={18} className="text-gold-deep" aria-hidden="true" />
                <div className="mt-3 flex flex-col-reverse">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="font-display text-lg font-bold sm:text-xl">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <Button to="/capacitaciones" className="mt-8">Ver capacitaciones <ArrowRight size={16} aria-hidden="true" /></Button>
        </motion.div>
      </div>
    </section>
  )
}
