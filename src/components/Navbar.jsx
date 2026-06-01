import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y > 80 && y < lastY)
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        visible || !scrolled ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'glass-nav' : 'bg-transparent'}`} style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-display font-bold text-lg tracking-[6px] text-navy uppercase group-hover:tracking-[8px] transition-all duration-500">DASHU</span>
            <span className="hidden sm:block text-[10px] text-stone tracking-[3px] uppercase font-medium border-l border-stone/30 pl-3 leading-none">For Men</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#ritual" className="text-xs text-navy/60 hover:text-navy transition-colors duration-300 tracking-wide uppercase font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-navy after:transition-all after:duration-300 hover:after:w-full">Ritual</a>
            <Link to="/tracking" className="text-xs text-navy/60 hover:text-navy transition-colors duration-300 tracking-wide uppercase font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-navy after:transition-all after:duration-300 hover:after:w-full">Tracking</Link>
            <Link to="/admin" className="text-xs text-navy/60 hover:text-navy transition-colors duration-300 tracking-wide uppercase font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-navy after:transition-all after:duration-300 hover:after:w-full">Admin</Link>
          </nav>
          <div className="flex items-center gap-4">
            <motion.button onClick={() => setIsOpen(true)} className="relative p-1.5 group"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-navy transition-colors duration-300 group-hover:text-gold">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-navy text-cream text-[9px] font-semibold flex items-center justify-center">
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
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cream/92 backdrop-blur-2xl flex flex-col items-center justify-center">
            <nav className="flex flex-col items-center gap-8 text-center">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Ritual', to: '/#ritual' },
                { label: 'Tracking', to: '/tracking' },
                { label: 'Admin', to: '/admin' },
              ].map((l, i) => (
                <motion.div key={l.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  {l.to.startsWith('/#') ? (
                    <a href={l.to} onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">{l.label}</a>
                  ) : (
                    <Link to={l.to} onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">{l.label}</Link>
                  )}
                </motion.div>
              ))}
            </nav>
            <p className="absolute bottom-10 text-xs text-stone/50 tracking-wider">DASHU FOR MEN © {new Date().getFullYear()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
