import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, X, MessageCircle } from 'lucide-react'
import { useCart, cartCount } from '../../store/cart'
import { whatsappLink } from '../../lib/contact'
import { Logo } from '../atoms/Logo'

const links = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/#precios', label: 'Precios por volumen' },
  { to: '/#como-usar', label: 'Cómo se usa' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/contacto', label: 'Contacto' },
]

// Sobre el hero oscuro del inicio se ve transparente; al hacer scroll se vuelve sólido.
export function Header({ overlay = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const count = useCart((s) => cartCount(s.items))
  const openCart = useCart((s) => s.open)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenu(false), [pathname, hash])

  const light = overlay && !scrolled && !menu
  const shell = light ? 'bg-transparent text-paper' : 'bg-bone/85 text-ink shadow-[0_1px_0_rgba(11,18,32,0.06)] backdrop-blur-xl'
  const wa = whatsappLink()

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ease-out ${shell}`}>
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link to="/" className="rounded-md" aria-label="Ir al inicio">
          <Logo tone={light ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                  isActive && !l.to.includes('#') ? (light ? 'bg-white/10' : 'bg-ink/[0.06]') : light ? 'hover:bg-white/10' : 'hover:bg-ink/5'
                }`
              }
            >
              {l.label}
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
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 font-mono text-[10px] font-medium text-ink"
              >
                {count}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${light ? 'hover:bg-white/10' : 'hover:bg-ink/5'}`}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menu}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            aria-label="Menú móvil"
            className="border-t border-sand bg-bone lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="container-x flex flex-col py-4">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="block border-b border-sand py-4 font-display text-2xl font-bold" style={{ fontStretch: '112%' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {wa && (
                <li className="pt-5">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-success">
                    <MessageCircle size={16} /> Escríbenos por WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
