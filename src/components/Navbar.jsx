import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${visible ? 'nav-glass nav-visible' : 'nav-hidden'}`}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-sm tracking-[8px] text-soot uppercase">
            Dashu
          </Link>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsOpen(true)} className="relative p-1.5 hover:opacity-60 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-soot">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-soot text-parchment text-[9px] font-semibold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 flex flex-col gap-1 group">
              <span className={`block w-5 h-[1.5px] bg-soot transition-all ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-soot transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-soot transition-all ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-parchment flex flex-col items-center justify-center" style={{ animation: 'enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <nav className="flex flex-col items-center gap-8 text-center">
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-soot hover:opacity-50 transition-opacity tracking-tight">Inicio</Link>
            <a href="#producto" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-soot hover:opacity-50 transition-opacity tracking-tight">Producto</a>
            <a href="#como-usar" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-soot hover:opacity-50 transition-opacity tracking-tight">Cómo Usar</a>
            <Link to="/tracking" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-soot hover:opacity-50 transition-opacity tracking-tight">Tracking</Link>
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="font-display text-3xl text-soot hover:opacity-50 transition-opacity tracking-tight">Admin</Link>
          </nav>
          <p className="absolute bottom-12 text-xs text-stone tracking-wider">DASHU © {new Date().getFullYear()}</p>
        </div>
      )}
    </>
  )
}
