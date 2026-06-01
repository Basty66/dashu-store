import { useState } from 'react'

const mockProducts = [
  { id: 1, name: 'Protein Down Cream 120ml', sku: 'DPC-120', stock: 34, status: 'Óptimo' },
  { id: 2, name: 'Protein Down Cream 60ml', sku: 'DPC-060', stock: 8, status: 'Bajo Stock' },
  { id: 3, name: 'Serum Facial 30ml', sku: 'SER-030', stock: 12, status: 'Óptimo' },
  { id: 4, name: 'Kit Dúo Crema + Serum', sku: 'KIT-001', stock: 3, status: 'Bajo Stock' },
]

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-sm">
          <h1 className="font-display font-bold text-2xl text-navy mb-6 text-center">Admin DASHU</h1>
          <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true) }} className="space-y-4">
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
            />
            <input
              type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-sm"
            />
            <button type="submit" className="btn-primary w-full justify-center">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-navy">Dashboard</h1>
          <button onClick={() => setLoggedIn(false)} className="text-sm text-gray-400 hover:text-red-500">
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Stock Total', value: '57', icon: 'inventory', change: '+12%' },
            { label: 'Órdenes Hoy', value: '12', icon: 'receipt_long', change: '-2%' },
            { label: 'Ingresos (mes)', value: '$1,249,500', icon: 'trending_up', change: '+8%' },
          ].map((card, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-navy">{card.icon}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  card.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-navy">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-lg text-navy mb-4">Inventario</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Producto</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">SKU</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Stock</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Estado</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-cream/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-navy">{p.name}</td>
                    <td className="py-3 px-2 text-gray-400">{p.sku}</td>
                    <td className="py-3 px-2 font-medium">{p.stock}</td>
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Óptimo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-navy/60 hover:text-navy text-xs font-medium">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
