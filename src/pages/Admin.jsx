import { useState } from 'react'

const mockProducts = [
  { id: 1, name: 'Protein Down Cream 120ml', sku: 'DPC-120', stock: 34, status: 'Óptimo' },
  { id: 2, name: 'Protein Down Cream 60ml', sku: 'DPC-060', stock: 8, status: 'Bajo' },
  { id: 3, name: 'Serum Facial 30ml', sku: 'SER-030', stock: 12, status: 'Óptimo' },
  { id: 4, name: 'Kit Dúo Crema + Serum', sku: 'KIT-001', stock: 3, status: 'Crítico' },
]

const statusStyles = {
  'Óptimo': 'bg-soot/10 text-soot',
  'Bajo': 'bg-clay/20 text-clay',
  'Crítico': 'bg-red-50 text-red-700',
}

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-parchment">
        <div className="card p-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="font-display font-bold text-xl tracking-[8px] text-soot uppercase mb-2">Dashu</p>
            <p className="text-xs text-stone">Panel de Administración</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true) }} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            <button type="submit" className="btn-primary w-full justify-center">Ingresar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-10 bg-parchment">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display font-bold text-3xl text-soot tracking-tight">Dashboard</h1>
          <button onClick={() => setLoggedIn(false)} className="text-xs text-stone hover:text-soot transition-colors uppercase tracking-wider">Salir</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Stock Total', value: '57', trend: '+12%', up: true },
            { label: 'Órdenes Hoy', value: '12', trend: '-2%', up: false },
            { label: 'Ventas del Mes', value: '$1,249,500', trend: '+8%', up: true },
          ].map((card, i) => (
            <div key={i} className="card p-6 hover:border-soot/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-stone uppercase tracking-wider">{card.label}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 ${
                  card.up ? 'bg-soot/10 text-soot' : 'bg-red-50 text-red-700'
                }`}>{card.trend}</span>
              </div>
              <p className="font-display font-bold text-2xl text-soot">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="card p-8 lg:p-10">
          <h2 className="font-display font-semibold text-sm tracking-wider uppercase text-soot mb-6">Inventario</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soot/5">
                  <th className="text-left py-3 px-2 text-xs text-stone font-medium uppercase tracking-wider">Producto</th>
                  <th className="text-left py-3 px-2 text-xs text-stone font-medium uppercase tracking-wider">SKU</th>
                  <th className="text-left py-3 px-2 text-xs text-stone font-medium uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-2 text-xs text-stone font-medium uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-2 text-xs text-stone font-medium uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map(p => (
                  <tr key={p.id} className="border-b border-soot/[0.02] hover:bg-smudge transition-colors">
                    <td className="py-4 px-2 font-medium text-soot">{p.name}</td>
                    <td className="py-4 px-2 text-stone">{p.sku}</td>
                    <td className="py-4 px-2 font-medium text-soot">{p.stock} unid.</td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${statusStyles[p.status] || 'bg-linen text-stone'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button className="text-xs text-stone hover:text-soot font-medium transition-colors">Editar</button>
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
