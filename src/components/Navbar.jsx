import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { clp } from '../lib/format'

const links = [
  { path: '/', label: 'Inicio' },
  { path: '/tracking', label: 'Tracking' },
]

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const searchRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }, [location.pathname])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length < 1) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    const results = allProducts.filter(p => p.title.toLowerCase().includes(q))
    setSearchResults(results.slice(0, 6))
  }, [searchQuery, allProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const goToProduct = (id) => {
    navigate(`/producto/${id}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

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
            <form onSubmit={handleSearch} className="relative">
              <motion.button type="button" onClick={() => setSearchOpen(!searchOpen)} title="Buscar (Ctrl+K)"
                className="p-3 rounded-lg hover:bg-navy/5 transition-colors"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Search size={18} strokeWidth={1.5} className="text-stone" />
              </motion.button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 z-50">
                    <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..." className="w-72 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm text-navy placeholder:text-outline-v focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-lg"
                      onBlur={() => setTimeout(() => setSearchOpen(false), 300)} />
                    {searchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-1 rounded-xl border border-navy/10 bg-white shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                        {searchResults.map(p => (
                          <button key={p.id} onClick={() => goToProduct(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-navy/5 transition-colors text-left border-b border-outline-v/5 last:border-0">
                            <div className="w-10 h-10 rounded-lg bg-cream/80 overflow-hidden flex-shrink-0">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline-v text-[10px]">?</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-navy truncate">{p.title}</p>
                              <p className="text-xs text-stone">
                                {p.offerPrice ? <>{clp(p.offerPrice)} <span className="line-through text-outline-v">{clp(p.price)}</span></> : clp(p.price)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            <motion.button onClick={() => setIsOpen(true)} data-cart-target
              className="relative p-3 rounded-lg hover:bg-navy/5 transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ShoppingBag size={20} strokeWidth={1.5} className="text-navy" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-navy text-cream text-[9px] font-semibold flex items-center justify-center rounded-full">
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
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
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
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
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
