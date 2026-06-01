import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagneticEffect } from '../hooks/useMousePosition'

export default function MagneticButton({ children, className = '', onClick, disabled = false, as = 'button', href = '' }) {
  const ref = useRef(null)
  const delta = useMagneticEffect(ref, 0.25)

  const Tag = as === 'a' ? motion.a : motion.button
  const props = as === 'a' ? { href } : { onClick, disabled, type: 'button' }

  return (
    <Tag
      ref={ref}
      {...props}
      animate={{ x: delta.x, y: delta.y, scale: delta.x !== 0 || delta.y !== 0 ? 1.02 : 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200, mass: 0.5 }}
      className={`${className} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </Tag>
  )
}
