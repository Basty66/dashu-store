import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/#como-usar', label: 'Cómo Usar' },
  { to: '/#producto', label: 'Producto' },
]

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-display font-bold text-xl tracking-[4px] text-navy">DASHU</span>
            <span className="font-body text-[8px] tracking-[6px] text-brown mt-3">FOR MEN</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a
                key={l.to}
                href={l.to}
                className="text-sm font-medium text-charcoal/70 hover:text-navy transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-navy">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-navy text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
