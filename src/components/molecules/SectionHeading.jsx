import { motion } from 'framer-motion'
import { Eyebrow } from '../atoms/Misc'

const ease = [0.16, 1, 0.3, 1]
const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }

// Título de sección que aparece de forma escalonada al entrar en pantalla.
export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'dark', className = '', as: Tag = 'h2' }) {
  const center = align === 'center' ? 'mx-auto text-center items-center' : ''
  const titleColor = tone === 'dark' ? 'text-ink' : 'text-paper'
  const descColor = tone === 'dark' ? 'text-muted' : 'text-paper/65'
  const MotionTag = motion[Tag] || motion.h2
  return (
    <motion.div
      className={`flex max-w-2xl flex-col gap-3 ${center} ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {eyebrow && <motion.div variants={item}><Eyebrow tone={tone === 'dark' ? 'gold' : 'light'}>{eyebrow}</Eyebrow></motion.div>}
      <MotionTag variants={item} className={`display-lg ${titleColor}`}>{title}</MotionTag>
      {description && <motion.p variants={item} className={`text-base leading-relaxed sm:text-lg ${descColor}`}>{description}</motion.p>}
    </motion.div>
  )
}
