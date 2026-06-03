import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_DURATION = 3
const LETTERS = [
  { char: 'D', x: 0 },
  { char: 'A', x: 26 },
  { char: 'S', x: 52 },
  { char: 'H', x: 78 },
  { char: 'U', x: 104 },
]

const letterVariants = {
  hidden: { y: 30, scale: 0.7, rotateX: -50 },
  visible: (i) => ({
    y: 0, scale: 1, rotateX: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.17, 0.67, 0.29, 1.05] },
  }),
}

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0)
  const progressRef = useRef(0)

  const handleFinish = useCallback(() => {
    setShow(false)
    setTimeout(onFinish, 700)
  }, [onFinish])

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 200)
    const t2 = setTimeout(() => setStage(2), 700)
    const t3 = setTimeout(() => setStage(3), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      const p = Math.min(elapsed / LOADING_DURATION, 1)
      progressRef.current = p
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    const timer = setTimeout(handleFinish, LOADING_DURATION * 1000)
    return () => clearTimeout(timer)
  }, [handleFinish])

  const CIRC = 2 * Math.PI * 18
  const CIRC2 = 2 * Math.PI * 22

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleFinish}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
          style={{ background: '#fff8f5' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(117,88,65,0.04) 0%, transparent 65%)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(15,32,56,0.02) 0%, transparent 55%)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />

            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]"
              style={{ background: 'radial-gradient(circle, rgba(117,88,65,0.06) 0%, transparent 60%)' }}
              animate={{ scale: [0.9, 1.2, 0.9], opacity: [0, 0.3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            <motion.div className="absolute w-[200px] h-[200px] rounded-full"
              style={{ top: 'calc(50% - 100px)', left: 'calc(50% - 100px)', border: '1px solid rgba(117,88,65,0.05)' }}
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div className="absolute w-[280px] h-[280px] rounded-full"
              style={{ top: 'calc(50% - 140px)', left: 'calc(50% - 140px)', border: '1px solid rgba(15,32,56,0.03)' }}
              animate={{ rotate: -360, scale: [1, 1.15, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div className="absolute top-[28%] left-[22%] w-[3px] h-[3px] rounded-full"
              style={{ background: 'rgba(117,88,65,0.25)' }}
              animate={{ y: [0, -50, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div className="absolute top-[65%] right-[18%] w-[2px] h-[2px] rounded-full"
              style={{ background: 'rgba(15,32,56,0.15)' }}
              animate={{ y: [0, -60, 0], opacity: [0, 0.4, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, delay: 1 }}
            />
            <motion.div className="absolute bottom-[30%] left-[28%] w-[4px] h-[4px] rounded-full"
              style={{ background: 'rgba(117,88,65,0.2)' }}
              animate={{ y: [0, -40, 0], opacity: [0, 0.45, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
            <motion.div className="absolute top-[42%] right-[32%] w-[2px] h-[2px] rounded-full"
              style={{ background: 'rgba(117,88,65,0.15)' }}
              animate={{ y: [0, -35, 0], opacity: [0, 0.3, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, delay: 0.7 }}
            />
            <motion.div className="absolute top-[55%] left-[15%] w-[2px] h-[2px] rounded-full"
              style={{ background: 'rgba(15,32,56,0.12)' }}
              animate={{ y: [0, -45, 0], opacity: [0, 0.35, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
            />
          </div>

          <div className="relative flex flex-col items-center">
            <div className="relative" style={{ perspective: '800px' }}>
              <motion.div className="absolute -inset-10 -z-10 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(117,88,65,0.06) 0%, transparent 70%)' }}
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <svg viewBox="0 0 300 60" className="h-auto w-[clamp(200px,50vw,340px)]" xmlns="http://www.w3.org/2000/svg">
                {LETTERS.map((l, i) => (
                  <motion.text
                    key={l.char}
                    x={l.x} y="42"
                    fontFamily="Hanken Grotesk, sans-serif" fontWeight="900" fontSize="34" fill="#0F2038" letterSpacing="2"
                    variants={letterVariants}
                    initial="hidden"
                    animate={stage >= 1 ? 'visible' : 'hidden'}
                    custom={i}
                  >
                    {l.char}
                  </motion.text>
                ))}
                <motion.text
                  x="145" y="42"
                  fontFamily="Hanken Grotesk, sans-serif" fontWeight="400" fontSize="18" fill="#0F2038" letterSpacing="1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  FOR MEN
                </motion.text>
                <motion.rect
                  x="0" y="50" width="275" height="2" fill="#0F2038"
                  initial={{ scaleX: 0 }}
                  animate={stage >= 2 ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformOrigin: 'left' }}
                />
              </svg>
            </div>

            <motion.div className="mt-10 relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={stage >= 2 ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(117,88,65,0.06)" strokeWidth="1" />
                <motion.circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="rgba(15,32,56,0.08)" strokeWidth="1" strokeLinecap="round"
                  strokeDasharray={CIRC2}
                  strokeDashoffset={CIRC2 * (1 - progress)}
                  style={{ transformOrigin: 'center' }}
                />
              </svg>
              <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90 absolute">
                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(117,88,65,0.08)" strokeWidth="1.5" />
                <motion.circle
                  cx="24" cy="24" r="18" fill="none"
                  stroke="#755841" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - progress)}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(117,88,65,0.25))' }}
                />
              </svg>
              <motion.div className="absolute flex flex-col items-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] font-semibold tabular-nums"
                  style={{ color: '#755841', fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {Math.round(progress * 100)}
                </span>
              </motion.div>
            </motion.div>

            <motion.p className="mt-8 text-xs tracking-[0.25em] uppercase"
              style={{ color: 'rgba(117,88,65,0.2)' }}
              initial={{ opacity: 0 }}
              animate={stage >= 3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              Toca para entrar
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
