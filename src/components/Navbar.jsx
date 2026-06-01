import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; setVisible(y > 80); setScrolled(y > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        visible ? 'nav-visible' : 'nav-hidden'
      } ${scrolled ? 'glass-nav' : 'bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="font-display font-bold text-lg tracking-[6px] text-navy uppercase">DASHU</span>
            <span className="hidden sm:block text-[10px] text-stone tracking-[3px] uppercase font-medium border-l border-stone/30 pl-3 leading-none">For Men</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#producto" className="text-xs text-navy/60 hover:text-navy transition-colors tracking-wide uppercase font-medium">Producto</a>
            <a href="/#ritual" className="text-xs text-navy/60 hover:text-navy transition-colors tracking-wide uppercase font-medium">Ritual</a>
            <Link to="/tracking" className="text-xs text-navy/60 hover:text-navy transition-colors tracking-wide uppercase font-medium">Tracking</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="relative p-1.5 hover:opacity-60 transition-opacity group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-navy">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-navy text-cream text-[9px] font-semibold flex items-center justify-center group-hover:scale-110 transition-transform">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 flex flex-col gap-1">
              <span className={`block w-5 h-[1.5px] bg-navy transition-all ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy transition-all ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-cream/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
          <nav className="flex flex-col items-center gap-8 text-center">
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">Inicio</Link>
            <a href="/#producto" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">Producto</a>
            <a href="/#ritual" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">Ritual</a>
            <Link to="/tracking" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">Tracking</Link>
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-navy hover:text-gold transition-colors">Admin</Link>
          </nav>
          <p className="absolute bottom-10 text-xs text-stone/50 tracking-wider">DASHU FOR MEN © {new Date().getFullYear()}</p>
        </div>
      )}
    </>
  )
}
