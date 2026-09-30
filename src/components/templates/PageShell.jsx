import { motion } from 'framer-motion'
import { Eyebrow } from '../atoms/Misc'
import { useSeo } from '../../hooks/useSeo'

const ease = [0.16, 1, 0.3, 1]
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }

// Encabezado estándar para páginas internas (legales, contacto, seguimiento...).
export function PageShell({ eyebrow, title, description, width = 'max-w-3xl', children }) {
  useSeo({ title, description })
  return (
    <div className="py-14 lg:py-20">
      <div className={`container-x ${width}`}>
        <motion.header className="mb-10 lg:mb-14" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}>
          {eyebrow && <motion.div variants={item}><Eyebrow>{eyebrow}</Eyebrow></motion.div>}
          <motion.h1 variants={item} className="display-lg mt-3">{title}</motion.h1>
          {description && <motion.p variants={item} className="mt-4 max-w-xl text-lg text-muted">{description}</motion.p>}
        </motion.header>
        {children}
      </div>
    </div>
  )
}

export function Prose({ children }) {
  return (
    <div className="space-y-8 text-[0.975rem] leading-relaxed text-ink/80 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_a]:underline [&_a]:decoration-gold [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      {children}
    </div>
  )
}
