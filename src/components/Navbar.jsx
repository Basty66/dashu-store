import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

const links = [
  { path: '/', label: 'Inicio' },
  { path: '/tracking', label: 'Tracking' },
]
=======
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
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
<<<<<<< HEAD
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])
=======
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

<<<<<<< HEAD
  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 glass-nav transition-all duration-300 ${scrolled ? 'shadow-md shadow-navy/5' : ''}`}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.svg viewBox="0 0 300 60" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg"
              whileHover={{ scale: 1.02 }}>
              <text x="0" y="42" fontFamily="Hanken Grotesk, sans-serif" fontWeight="900" fontSize="34" fill="#0F2038" letterSpacing="2">DASHU</text>
              <text x="140" y="42" fontFamily="Hanken Grotesk, sans-serif" fontWeight="300" fontSize="18" fill="#0F2038" letterSpacing="1">FOR MEN</text>
              <rect x="0" y="50" width="275" height="2" fill="#0F2038" />
            </motion.svg>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link, i) => (
              <motion.div key={link.path} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                    isActive(link.path) ? 'text-navy bg-navy/10' : 'text-stone hover:text-navy hover:bg-navy/5'
                  }`}>
                  {link.label}
                  {isActive(link.path) && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg bg-navy/10 -z-10"
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }} />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-1">
              <motion.button onClick={() => setIsOpen(true)} data-cart-target
              className="relative p-3 rounded-lg hover:bg-navy/5 transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ShoppingBag size={20} strokeWidth={1.5} className="text-navy" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-navy text-cream text-[9px] font-semibold flex items-center justify-center rounded-full">
=======
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
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
<<<<<<< HEAD
            <motion.button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-3 rounded-lg hover:bg-navy/5 transition-colors"
              whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={20} className="text-navy" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={20} className="text-navy" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
=======
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 flex flex-col gap-1">
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
<<<<<<< HEAD
          <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(20px)' }} exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-40 bg-cream/95 flex items-center justify-center">
            <nav className="flex flex-col items-center gap-6">
              {links.map((link, i) => (
                <motion.div key={link.path}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.05 }}>
                  <Link to={link.path} onClick={() => setMenuOpen(false)}
                    className={`block h-lg text-2xl transition-colors duration-200 ${
                      isActive(link.path) ? 'text-gold' : 'text-navy hover:text-gold'
                    }`}>
                    {link.label}
                  </Link>
=======
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
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
