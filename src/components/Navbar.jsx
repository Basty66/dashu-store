import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const LogoSvg = () => (
  <svg viewBox="0 0 300 60" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="45" fontFamily="Hanken Grotesk, sans-serif" fontWeight="900" fontSize="36" fill="#0F2038" letterSpacing="2">DASHU</text>
    <text x="145" y="45" fontFamily="Hanken Grotesk, sans-serif" fontWeight="300" fontSize="20" fill="#0F2038" letterSpacing="1">FOR MEN</text>
    <rect x="0" y="52" width="280" height="2" fill="#0F2038" />
  </svg>
)

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 glass-nav transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <LogoSvg />
          </Link>
          <div className="hidden md:flex items-center gap-8 h-full">
            {[
              { label: 'Inicio', href: '/' },
              { label: 'Cómo Usar', href: '/#como-usar' },
              { label: 'Tracking', href: '/tracking' },
            ].map((l) => (
              l.href.startsWith('/#') ? (
                <a key={l.label} href={l.href}
                  className="label text-xs text-stone hover:text-navy transition-colors h-full flex items-center tracking-[0.12em]">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href}
                  className="label text-xs text-stone hover:text-navy transition-colors h-full flex items-center tracking-[0.12em]">
                  {l.label}
                </Link>
              )
            ))}
          </div>
          <div className="flex items-center gap-3">
            <motion.button onClick={() => setIsOpen(true)} className="relative p-2"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F2038" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-navy text-white text-[9px] font-semibold flex items-center justify-center rounded-full">
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 flex flex-col gap-1">
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cream/90 backdrop-blur-2xl flex flex-col items-center justify-center">
            <nav className="flex flex-col items-center gap-8">
              {['Inicio', 'Cómo Usar', 'Tracking', 'Admin'].map((l, i) => (
                <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  {l === 'Inicio' ? (
                    <Link to="/" onClick={() => setMenuOpen(false)} className="h-lg text-navy hover:text-gold transition-colors">{l}</Link>
                  ) : l === 'Cómo Usar' ? (
                    <a href="/#como-usar" onClick={() => setMenuOpen(false)} className="h-lg text-navy hover:text-gold transition-colors">{l}</a>
                  ) : (
                    <Link to={`/${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="h-lg text-navy hover:text-gold transition-colors">{l}</Link>
                  )}
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
