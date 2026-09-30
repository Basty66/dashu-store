import { motion } from 'framer-motion'
import { SectionHeading } from '../molecules/SectionHeading'

const steps = [
  { n: '01', title: 'Aplica en seco', text: 'Distribuye la crema en la zona lateral que quieres alisar, desde la raíz y con el cabello seco.' },
  { n: '02', title: 'Peina y espera', text: 'Peina el cabello hacia abajo, pegado a la cabeza, y deja actuar unos 10 minutos.' },
  { n: '03', title: 'Enjuaga y listo', text: 'Lava con agua y shampoo, seca y peina como siempre. El resultado se mantiene por semanas.' },
]

export function HowToUse() {
  return (
    <section id="como-usar" className="relative overflow-hidden bg-navy py-14 text-paper sm:py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading tone="light" eyebrow="Cómo se usa" title="Tres pasos. Sin herramientas." />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-4xl bg-white/10 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-5 bg-navy p-6 sm:block sm:p-8 lg:p-10"
            >
              <span className="flex-none font-display text-5xl font-black leading-none text-gold/90 sm:text-7xl" style={{ fontStretch: '125%' }}>{s.n}</span>
              <div>
                <h3 className="text-xl font-bold sm:mt-8 sm:text-2xl">{s.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-paper/65 sm:mt-3 sm:text-base">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-paper/50">Recomendamos probar primero en una mecha pequeña. Evita el contacto con ojos y piel irritada.</p>
      </div>
    </section>
  )
}
