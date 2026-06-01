import { useState } from 'react'

const mockProducts = [
  { id: 1, name: 'Protein Down Cream 120ml', sku: 'DPC-120', stock: 34, status: 'Óptimo' },
  { id: 2, name: 'Protein Down Cream 60ml', sku: 'DPC-060', stock: 8, status: 'Bajo' },
  { id: 3, name: 'Serum Facial 30ml', sku: 'SER-030', stock: 12, status: 'Óptimo' },
  { id: 4, name: 'Kit Dúo Crema + Serum', sku: 'KIT-001', stock: 3, status: 'Crítico' },
]

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card-premium p-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="font-display font-bold text-2xl tracking-[6px] text-charcoal">DASHU</span>
            <p className="text-xs text-slate mt-1">Panel de Administración</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true) }} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium" />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium" />
            <button type="submit" className="btn-primary w-full justify-center text-sm">Ingresar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display font-bold text-3xl text-charcoal tracking-tight">Dashboard</h1>
          <button onClick={() => setLoggedIn(false)} className="text-xs text-slate hover:text-charcoal transition-colors uppercase tracking-wider">
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Stock Total', value: '57', trend: '+12%', up: true },
            { label: 'Órdenes Hoy', value: '12', trend: '-2%', up: false },
            { label: 'Ventas del Mes', value: '$1,249,500', trend: '+8%', up: true },
          ].map((card, i) => (
            <div key={i} className="card-premium p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate uppercase tracking-wider">{card.label}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  card.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {card.trend}
                </span>
              </div>
              <p className="font-display font-bold text-2xl text-charcoal">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="card-premium p-8">
          <h2 className="font-display font-semibold text-base text-charcoal mb-6">Inventario</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-3 px-2 text-xs text-slate font-medium uppercase tracking-wider">Producto</th>
                  <th className="text-left py-3 px-2 text-xs text-slate font-medium uppercase tracking-wider">SKU</th>
                  <th className="text-left py-3 px-2 text-xs text-slate font-medium uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-2 text-xs text-slate font-medium uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-2 text-xs text-slate font-medium uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map(p => (
                  <tr key={p.id} className="border-b border-black/[0.02] hover:bg-black/[0.02] transition-colors">
                    <td className="py-4 px-2 font-medium text-charcoal">{p.name}</td>
                    <td className="py-4 px-2 text-slate">{p.sku}</td>
                    <td className="py-4 px-2 font-medium">{p.stock} unid.</td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                        p.status === 'Óptimo' ? 'bg-green-50 text-green-700' :
                        p.status === 'Crítico' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button className="text-xs text-slate hover:text-charcoal font-medium transition-colors">Editar</button>
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
