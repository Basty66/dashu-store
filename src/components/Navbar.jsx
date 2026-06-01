import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-premium py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-1.5 group">
            <span className="font-display font-bold text-xl tracking-[6px] text-charcoal group-hover:opacity-70 transition-opacity">
              DASHU
            </span>
            <span className="font-body text-[7px] tracking-[8px] text-taupe uppercase">
              For Men
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/tracking"
              className="hidden sm:block font-body text-xs text-stone/60 hover:text-charcoal transition-colors tracking-wide uppercase"
            >
              Tracking
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Abrir carrito"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-charcoal text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
