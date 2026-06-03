import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartFly() {
  const { flyItem } = useCart()
  const [target, setTarget] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (flyItem) {
      const el = document.querySelector('[data-cart-target]')
      if (el) {
        const r = el.getBoundingClientRect()
        setTarget({ left: r.left + r.width / 2 - 12, top: r.top + r.height / 2 - 12 })
      }
    }
  }, [flyItem])

  if (!flyItem) return null

  const sx = flyItem.left
  const sy = flyItem.top
  const tx = target.left
  const ty = target.top
  const midY = Math.min(sy, ty) - 80

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      <motion.div
        key={`${flyItem.left}-${flyItem.top}`}
        className="absolute"
        initial={{ left: sx, top: sy, width: flyItem.width, height: flyItem.height, opacity: 1, scale: 1 }}
        animate={{
          left: [sx, (sx + tx) / 2, tx],
          top: [sy, midY, ty],
          width: [flyItem.width, flyItem.width * 0.5, 24],
          height: [flyItem.height, flyItem.height * 0.5, 24],
          opacity: [1, 1, 0.5],
          scale: [1, 0.8, 0.5],
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="w-full h-full rounded-lg overflow-hidden shadow-xl border border-white/30"
          style={{ background: '#fff8f5' }}>
          {flyItem.image ? (
            <img src={flyItem.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: '#0F2038' }} />
          )}
        </div>
      </motion.div>
    </div>
  )
}
