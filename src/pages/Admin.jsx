import { useState } from 'react'
import { motion } from 'framer-motion'

let nextId = 5
const initialProducts = [
  { id: 1, name: 'Protein Down Cream 120ml', sku: 'DPC-120', stock: 42, status: 'Óptimo', price: 24990 },
  { id: 2, name: 'Protein Down Cream 60ml', sku: 'DPC-060', stock: 8, status: 'Bajo', price: 15990 },
  { id: 3, name: 'Protein Down Serum 30ml', sku: 'SER-030', stock: 15, status: 'Óptimo', price: 18990 },
  { id: 4, name: 'Kit Dúo Crema + Serum', sku: 'KIT-001', stock: 3, status: 'Crítico', price: 37990 },
]

const statusStyles = {
  'Óptimo': 'bg-navy/10 text-navy',
  'Bajo': 'bg-gold/20 text-gold',
  'Crítico': 'bg-red-50 text-red-700',
}

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: 0, price: 0 })

  const addProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name) return
    setProducts(prev => [...prev, { ...newProduct, id: nextId++, status: newProduct.stock > 10 ? 'Óptimo' : newProduct.stock > 0 ? 'Bajo' : 'Crítico' }])
    setNewProduct({ name: '', sku: '', stock: 0, price: 0 })
    setShowForm(false)
  }

  const toggleStock = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock > 0 ? 0 : 42 } : p))
  }

  const stats = {
    totalStock: products.reduce((s, p) => s + p.stock, 0),
    totalSales: 1249500,
    conversion: 3.2,
    orders: 47,
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
        <div className="glass-card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="font-display font-bold text-lg tracking-[6px] text-navy uppercase mb-1">Dashu</p>
            <p className="text-xs text-stone">Panel de Administración</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true) }} className="space-y-3">
            <input type="email" placeholder="admin@dashu.cl" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            <button type="submit" className="btn-primary w-full justify-center">Ingresar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-cream">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-navy tracking-tight">Dashboard</h1>
            <p className="text-xs text-stone mt-1">Panel de control de inventario</p>
          </div>
          <button onClick={() => setLoggedIn(false)} className="text-xs text-stone hover:text-navy transition-colors uppercase tracking-wider">Salir</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Stock Total', value: stats.totalStock, suffix: 'unid.' },
            { label: 'Ventas del Mes', value: '$1,249,500', suffix: '' },
            { label: 'Órdenes', value: stats.orders, suffix: '' },
            { label: 'Conversión', value: '3.2', suffix: '%' },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5">
              <p className="text-[11px] text-stone uppercase tracking-wider mb-1">{card.label}</p>
              <p className="font-display font-bold text-xl text-navy">{card.value} <span className="text-xs font-normal text-stone">{card.suffix}</span></p>
            </motion.div>
          ))}
        </div>

        {/* Inventory */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-navy/[0.04]">
            <h2 className="font-semibold text-xs tracking-wider uppercase text-navy/80">Inventario</h2>
            <button onClick={() => setShowForm(!showForm)} className="text-xs text-navy hover:text-gold transition-colors font-medium uppercase tracking-wider">
              {showForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addProduct} className="px-6 py-4 border-b border-navy/[0.04] bg-ivory/50">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <input placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="input text-xs" />
                <input placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} className="input text-xs" />
                <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} className="input text-xs" />
                <input type="number" placeholder="Precio" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} className="input text-xs" />
                <button type="submit" className="btn-primary justify-center text-xs">Guardar</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy/[0.03]">
                  {['Producto', 'SKU', 'Precio', 'Stock', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[11px] text-stone font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <motion.tr key={p.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-navy/[0.02] hover:bg-navy/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-navy text-sm">{p.name}</td>
                    <td className="py-3 px-4 text-stone text-xs">{p.sku}</td>
                    <td className="py-3 px-4 text-navy text-sm">${p.price.toLocaleString('es-CL')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : 'text-navy'}`}>
                        {p.stock} unid.
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${statusStyles[p.status] || 'bg-ivory text-stone'}`}>
                        {p.status}
                      </span>
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
    </div>
  )
}
