import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { ShoppingBag, MessageCircle, ArrowUpRight } from 'lucide-react'
import { useCart, cartCount } from '../../store/cart'
import { whatsappLink } from '../../lib/contact'
import { useScrollLock } from '../../lib/smoothScroll'
import { Logo } from '../atoms/Logo'

const links = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/capacitaciones', label: 'Capacitaciones' },
  { to: '/distribuidores', label: 'Distribuidores' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/contacto', label: 'Contacto' },
]

const ease = [0.16, 1, 0.3, 1]

// Ícono de menú que se transforma en X.
function MenuIcon({ open }) {
  return (
    <span className="relative block h-3 w-5" aria-hidden="true">
      <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
      <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
    </span>
  )
}

function MobileMenu({ open, onClose }) {
  const wa = whatsappLink()
  useScrollLock(open)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          aria-label="Menú móvil"
          data-lenis-prevent
          className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto bg-bone lg:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.55, ease }}
        >
          <motion.ul className="container-x flex flex-col pb-10 pt-4" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } }}>
            {links.map((l) => (
              <motion.li key={l.to} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}>
                <NavLink
                  to={l.to}
                  onClick={onClose}
                  className={({ isActive }) => `group flex items-center justify-between border-b border-sand py-5 font-display text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-gold-deep' : 'text-ink hover:text-gold-deep'}`}
                  style={{ fontStretch: '112%' }}
                >
                  {l.label}
                  <ArrowUpRight size={22} className="opacity-30 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
                </NavLink>
              </motion.li>
            ))}
            {wa && (
              <motion.li className="pt-8" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }}>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-success">
                  <MessageCircle size={16} /> Escríbenos por WhatsApp
                </a>
              </motion.li>
            )}
          </motion.ul>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

// Sobre el hero oscuro del inicio es transparente; al bajar se vuelve sólido,
// se esconde mientras se baja y reaparece apenas se sube.
export function Header({ overlay = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const count = useCart((s) => cartCount(s.items))
  const openCart = useCart((s) => s.open)
  const cartOpen = useCart((s) => s.isOpen)
  const { pathname, hash } = useLocation()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 })

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    if (Math.abs(y - previous) > 4) setHidden(y > previous && y > 160)
  })

  useEffect(() => {
    setMenu(false)
    setHidden(false)
  }, [pathname, hash])

  const light = overlay && !scrolled && !menu
  const shell = light ? 'bg-transparent text-paper' : 'bg-bone/85 text-ink shadow-[0_1px_0_rgba(23,18,16,0.06)] backdrop-blur-xl'

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-colors duration-300 ease-out ${shell}`}
      animate={{ y: hidden && !menu && !cartOpen ? '-100%' : '0%' }}
      transition={{ duration: 0.4, ease }}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link to="/" className="rounded-md" aria-label="Ir al inicio">
          <Logo tone={light ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="relative isolate rounded-full px-4 py-2 text-sm transition-colors duration-200">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 -z-10 rounded-full ${light ? 'bg-white/10' : 'bg-ink/[0.07]'}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100">
                    {l.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 ${light ? 'hover:bg-white/10' : 'hover:bg-ink/5'}`}
            aria-label={`Abrir carrito (${count} productos)`}
          >
            <ShoppingBag size={21} strokeWidth={1.7} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 font-mono text-[10px] font-medium text-ink"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            className={`grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 lg:hidden ${light ? 'hover:bg-white/10' : 'hover:bg-ink/5'}`}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menu}
          >
            <MenuIcon open={menu} />
          </button>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gold transition-opacity duration-300 ${scrolled && !menu ? 'opacity-100' : 'opacity-0'}`}
        style={{ scaleX: progress }}
      />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </motion.header>
  )
}
