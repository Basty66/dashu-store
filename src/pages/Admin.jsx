import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCart } from '../context/CartContext'

let nextId = 5
const initialProducts = [
  { id: 1, name: 'Protein Down Cream 120ml', sku: 'DPC-120', stock: 42, status: 'Óptimo', price: 24990 },
  { id: 2, name: 'Protein Down Cream 60ml', sku: 'DPC-060', stock: 8, status: 'Bajo', price: 15990 },
  { id: 3, name: 'Protein Down Serum 30ml', sku: 'SER-030', stock: 15, status: 'Óptimo', price: 18990 },
  { id: 4, name: 'Kit Dúo Crema + Serum', sku: 'KIT-001', stock: 3, status: 'Crítico', price: 37990 },
]

const statusStyles = {
  'Óptimo': 'bg-navy/10 text-navy', 'Bajo': 'bg-gold/15 text-gold', 'Crítico': 'bg-red-50 text-red-700',
}

function AnimatedCounter({ value, suffix = '' }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const spring = useSpring(count, { damping: 25, stiffness: 200 })

  useEffect(() => { spring.set(value) }, [value, spring])

  return (
    <span className="font-display font-bold text-xl text-navy">
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="text-xs font-normal text-stone ml-0.5">{suffix}</span>}
    </span>
  )
}

export default function Admin() {
  const { items: cartItems } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: 0, price: 0 })
  const [floatingOpen, setFloatingOpen] = useState(false)
  const fabRef = useRef(null)

  useEffect(() => {
    if (!floatingOpen) return
    const handler = (e) => { if (fabRef.current && !fabRef.current.contains(e.target)) setFloatingOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [floatingOpen])

  const addProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name) return
    setProducts(prev => [...prev, { ...newProduct, id: nextId++, status: newProduct.stock > 10 ? 'Óptimo' : newProduct.stock > 0 ? 'Bajo' : 'Crítico' }])
    setNewProduct({ name: '', sku: '', stock: 0, price: 0 }); setShowForm(false)
  }

  const toggleStock = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock > 0 ? 0 : 42 } : p))

  const stats = { totalStock: products.reduce((s, p) => s + p.stock, 0), totalSales: 1249500, orders: 47 }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
        <div className="glass p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="font-display font-bold text-lg tracking-[6px] text-navy uppercase mb-1">Dashu</p>
            <p className="text-xs text-stone">Panel de Administración</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true) }} className="space-y-3">
            <div className="floating-input-wrap">
              <input type="email" placeholder="" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>admin@dashu.cl</label>
            </div>
            <div className="floating-input-wrap">
              <input type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} />
              <label>Contraseña</label>
            </div>
            <motion.button type="submit" className="btn-primary w-full justify-center"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>Ingresar</motion.button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-cream" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-navy tracking-tight">Dashboard</h1>
            <p className="text-xs text-stone mt-1">Panel de control</p>
          </div>
          <button onClick={() => setLoggedIn(false)} className="text-xs text-stone hover:text-navy transition-colors uppercase tracking-wider relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-stone after:transition-all after:duration-300 hover:after:w-full">Salir</button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Stock Total', value: stats.totalStock, suffix: 'unid.' },
            { label: 'Ventas del Mes', value: stats.totalSales, suffix: '', prefix: '$' },
            { label: 'Órdenes', value: stats.orders, suffix: '' },
            { label: 'Carritos', value: cartItems.length, suffix: 'items' },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-5">
              <p className="text-[11px] text-stone uppercase tracking-wider mb-1">{card.label}</p>
              {card.prefix && <span className="font-display font-bold text-xl text-navy">{card.prefix}</span>}
              {card.value && <AnimatedCounter value={card.value} suffix={card.suffix} />}
            </motion.div>
          ))}
        </div>

        {/* Inventory table */}
        <div className="glass overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-navy/[0.03]">
            <h2 className="font-semibold text-xs tracking-wider uppercase text-navy/70">Inventario</h2>
            <button onClick={() => setShowForm(!showForm)} className="text-xs text-navy hover:text-gold transition-colors font-medium uppercase tracking-wider">
              {showForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                onSubmit={addProduct} className="px-6 py-4 border-b border-navy/[0.03] bg-cream/50 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <input placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="input text-xs" />
                  <input placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} className="input text-xs" />
                  <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} className="input text-xs" />
                  <input type="number" placeholder="Precio" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} className="input text-xs" />
                  <motion.button type="submit" className="btn-primary justify-center text-xs"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Guardar</motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy/[0.02]">
                  {['Producto', 'SKU', 'Precio', 'Stock', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[11px] text-stone font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-navy/[0.02] hover:bg-navy/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-navy text-sm">{p.name}</td>
                    <td className="py-3 px-4 text-stone text-xs">{p.sku}</td>
                    <td className="py-3 px-4 text-navy text-sm">${p.price.toLocaleString('es-CL')}</td>
                    <td className="py-3 px-4"><span className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : 'text-navy'}`}>{p.stock} unid.</span></td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${statusStyles[p.status] || 'bg-white/60 text-stone border border-navy/5'}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleStock(p.id)}
                        className="text-[11px] text-stone hover:text-navy font-medium transition-colors uppercase tracking-wider">
                        {p.stock > 0 ? 'Agotar' : 'Restaurar'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating glass dashboard toggle */}
      <div ref={fabRef} className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {floatingOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="glass-strong p-5 mb-3 min-w-[200px]">
              <p className="text-[11px] text-stone uppercase tracking-wider mb-3">Resumen Rápido</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-stone">Stock total</span><span className="font-medium text-navy">{stats.totalStock} unid.</span></div>
                <div className="flex justify-between text-xs"><span className="text-stone">Órdenes</span><span className="font-medium text-navy">{stats.orders}</span></div>
                <div className="flex justify-between text-xs"><span className="text-stone">Carritos</span><span className="font-medium text-navy">{cartItems.length} items</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button onClick={() => setFloatingOpen(!floatingOpen)}
          className="w-12 h-12 glass-strong flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B192C" strokeWidth="1.2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
