import { useEffect, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { STORE, FOUNDER } from '@shared/store.js'
import { Logo } from '../atoms/Logo'

const ease = [0.16, 1, 0.3, 1]
const radius = '5.5cqw'
const faceStyle = { borderRadius: radius, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', boxShadow: '0 30px 60px -24px rgba(23, 18, 16, 0.5)' }
const float = { rotateX: 0, y: [0, -7, 0] }
const still = { rotateX: 0 }
const flip = {
  front: { rotateY: 0, scale: [1, 1.05, 1] },
  back: { rotateY: 180, scale: [1, 1.05, 1] },
}
// Destellos dorados que salen del centro cuando la tarjeta muestra el agradecimiento
// (animación CSS "spark" en index.css; distancias en cqw, relativas al ancho de la tarjeta).
const sparks = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 2) * 0.18
  const r = 36 + (i % 3) * 8
  return { tx: `${(Math.cos(a) * r).toFixed(1)}cqw`, ty: `${(Math.sin(a) * r * 0.8).toFixed(1)}cqw`, size: 3 + (i % 3) * 2, delay: 0.45 + (i % 4) * 0.05 }
})

function Sparks() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {sparks.map((p, i) => (
        <span
          key={i}
          className="spark absolute left-1/2 top-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(201,162,126,0.95)]"
          style={{ width: p.size, height: p.size, '--tx': p.tx, '--ty': p.ty, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  )
}

function Front({ code, label, glare, glareOpacity, reduce }) {
  return (
    <div aria-hidden="true" className="grain absolute inset-0 overflow-hidden bg-ink text-paper ring-1 ring-inset ring-white/10" style={faceStyle}>
      <div className="absolute -right-[20%] -top-[45%] h-[110%] w-[65%] rounded-full bg-gold/25 blur-3xl" />
      <div className="absolute -bottom-[55%] -left-[15%] h-[110%] w-[60%] rounded-full bg-blush/15 blur-3xl" />
      {!reduce && (
        // Brillo metálico que cruza la tarjeta al aparecer.
        <motion.div
          className="absolute inset-y-[-20%] left-0 w-[35%] bg-gradient-to-r from-transparent via-white/25 to-transparent"
          style={{ skewX: -18 }}
          initial={{ x: '-120%' }}
          animate={{ x: '420%' }}
          transition={{ duration: 1.3, delay: 0.7, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
      <motion.div className="absolute inset-0" style={{ background: glare, opacity: glareOpacity }} />
      <div className="relative flex h-full flex-col justify-between" style={{ padding: '6.5cqw' }}>
        <div className="flex items-start justify-between">
          <p className="font-mono uppercase tracking-[0.22em] text-gold" style={{ fontSize: 'max(10px, 2.6cqw)' }}>Origen Corea del Sur</p>
          {/* Chip dorado, como una tarjeta de socio. */}
          <div className="relative overflow-hidden rounded-[18%] bg-gradient-to-br from-gold-light via-gold to-gold-deep" style={{ width: '11cqw', height: '8.5cqw' }}>
            <div className="absolute inset-x-0 top-1/2 h-px bg-ink/25" />
            <div className="absolute inset-y-0 left-1/3 w-px bg-ink/25" />
            <div className="absolute inset-y-0 right-1/3 w-px bg-ink/25" />
          </div>
        </div>
        <div>
          <p
            className="bg-gradient-to-br from-[#F6E3C8] via-gold to-[#9A7148] bg-clip-text font-display font-black leading-none tracking-[0.1em] text-transparent"
            style={{ fontSize: '17cqw', fontStretch: '125%' }}
          >
            {STORE.wordmark}
          </p>
          <p className="mt-[1.5cqw] font-mono uppercase tracking-[0.5em] text-gold/80" style={{ fontSize: 'max(10px, 2.6cqw)' }}>{STORE.wordmarkSuffix}</p>
        </div>
        <div className="flex items-end justify-between font-mono uppercase tracking-[0.16em] text-paper/55" style={{ fontSize: 'max(10px, 2.6cqw)' }}>
          <span>{code}</span>
          <span>{label}</span>
        </div>
      </div>
    </div>
  )
}

function Back({ name, code, message, note, glare, glareOpacity }) {
  return (
    <div aria-hidden="true" className="grain absolute inset-0 overflow-hidden bg-blush-light text-ink ring-1 ring-inset ring-ink/5" style={{ ...faceStyle, transform: 'rotateY(180deg)' }}>
      <div className="absolute -right-[15%] -top-[40%] h-[100%] w-[55%] rounded-full bg-gold/30 blur-3xl" />
      <div className="absolute -bottom-[50%] left-[10%] h-[90%] w-[60%] rounded-full bg-blush/80 blur-3xl" />
      <motion.div className="absolute inset-0" style={{ background: glare, opacity: glareOpacity }} />
      <div className="relative flex h-full flex-col justify-between" style={{ padding: '6.5cqw' }}>
        <div className="flex items-center justify-between">
          <Logo />
          <span className="font-mono uppercase tracking-[0.16em] text-muted" style={{ fontSize: 'max(10px, 2.6cqw)' }}>{code}</span>
        </div>
        <div>
          <p className="text-balance font-display font-black leading-[0.98]" style={{ fontSize: '8.4cqw', fontStretch: '110%' }}>{message}</p>
          <p className="font-serif italic leading-tight text-gold-deep" style={{ fontSize: '10cqw' }}>{name}.</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <p className="max-w-[58%] text-left leading-snug text-ink/60" style={{ fontSize: 'max(11px, 2.9cqw)' }}>{note}</p>
          <p className="text-right leading-none">
            <span className="block font-serif italic text-ink" style={{ fontSize: '5.2cqw' }}>{FOUNDER.name}</span>
            <span className="mt-[1cqw] block font-mono uppercase tracking-[0.18em] text-muted" style={{ fontSize: 'max(9px, 2.1cqw)' }}>Fundador</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Tarjeta de agradecimiento después de pagar: aparece con el logo DASHU, pasa un brillo
// dorado y se gira sola para dar las gracias. Se puede volver a girar con un toque o clic;
// con mouse se inclina siguiendo el puntero. Si el sistema pide menos movimiento, muestra
// directo el reverso y gira sin animación.
export function ThankYouCard({ name, code, label = 'Down Permanent', message = 'Gracias por tu compra,', note = 'Te avisaremos cuando tu pedido salga a despacho.' }) {
  const reduce = useReducedMotion()
  const [flipped, setFlipped] = useState(Boolean(reduce))
  const [burst, setBurst] = useState(0)

  // Cada vez que muestra el agradecimiento, suelta destellos.
  function turn(toBack) {
    setFlipped(toBack)
    if (toBack && !reduce) setBurst((b) => b + 1)
  }

  useEffect(() => {
    if (reduce) return undefined
    const t = setTimeout(() => {
      setFlipped(true)
      setBurst((b) => b + 1)
    }, 2100)
    return () => clearTimeout(t)
  }, [reduce])

  // Inclinación y reflejo que siguen al mouse.
  const rotateX = useSpring(0, { stiffness: 140, damping: 16 })
  const rotateY = useSpring(0, { stiffness: 140, damping: 16 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glareOpacity = useSpring(0, { stiffness: 120, damping: 20 })
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.3), transparent 55%)`
  const mirroredX = useTransform(gx, (v) => 100 - v)
  const glareBack = useMotionTemplate`radial-gradient(circle at ${mirroredX}% ${gy}%, rgba(255,255,255,0.45), transparent 55%)`

  function onPointerMove(e) {
    if (e.pointerType !== 'mouse' || reduce) return
    const b = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width
    const py = (e.clientY - b.top) / b.height
    rotateX.set((0.5 - py) * 14)
    rotateY.set((px - 0.5) * 18)
    gx.set(px * 100)
    gy.set(py * 100)
    glareOpacity.set(1)
  }
  function onPointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
    glareOpacity.set(0)
  }

  return (
    <div className="relative mx-auto w-full max-w-[440px]" style={{ containerType: 'inline-size' }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
        className="relative"
        style={{ perspective: 1400 }}
      >
        <motion.button
          type="button"
          onClick={() => turn(!flipped)}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          aria-label={flipped ? 'Ver el frente de la tarjeta DASHU' : 'Girar la tarjeta de agradecimiento'}
          className="relative block aspect-[1.586] w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-bone"
          style={{ borderRadius: radius, transformStyle: 'preserve-3d' }}
          initial={reduce ? false : { rotateX: 32 }}
          animate={reduce ? still : float}
          transition={{ rotateX: { duration: 1.1, ease }, y: { duration: 6, delay: 1.2, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
              variants={flip}
              initial={false}
              animate={flipped ? 'back' : 'front'}
              transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
            >
              <Front code={code} label={label} glare={glare} glareOpacity={glareOpacity} reduce={reduce} />
              <Back name={name} code={code} message={message} note={note} glare={glareBack} glareOpacity={glareOpacity} />
            </motion.div>
          </motion.div>
        </motion.button>
        {burst > 0 && <Sparks key={burst} />}
      </motion.div>
      {/* El aviso aparece después del primer giro (su espacio queda reservado para no mover la página). */}
      <motion.p
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: flipped ? 1 : 0 }}
        transition={{ duration: 0.5, delay: flipped && !reduce ? 1.1 : 0 }}
      >
        <RotateCw size={12} aria-hidden="true" />
        <span className="[@media(hover:hover)]:hidden">Toca la tarjeta para girarla</span>
        <span className="hidden [@media(hover:hover)]:inline">Haz clic en la tarjeta para girarla</span>
      </motion.p>
    </div>
  )
}
