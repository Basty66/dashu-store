import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api } from '../../lib/api'
import { useSeo } from '../../hooks/useSeo'
import { AdminLayout } from '../../components/templates/AdminLayout'
import AdminLogin from './AdminLogin'
import Dashboard from './Dashboard'
import Orders from './Orders'
import OrderDetail from './OrderDetail'
import Products from './Products'
import ProductEditor from './ProductEditor'
import Coupons from './Coupons'
import Seminars from './Seminars'
import SeminarEditor from './SeminarEditor'
import Distributors from './Distributors'
import { Reviews, Messages } from './Inbox'

// Protege las rutas del panel: sin sesión válida redirige al login.
function RequireSession({ children }) {
  const [state, setState] = useState('checking')
  const location = useLocation()
  useEffect(() => {
    api('/admin/session')
      .then((r) => setState(r.authenticated ? 'ok' : 'out'))
      .catch(() => setState('out'))
  }, [location.pathname])
  if (state === 'checking') return <div className="min-h-screen bg-bone" aria-busy="true" />
  if (state === 'out') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}

export default function AdminApp() {
  useSeo({ title: 'Administración' })
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<RequireSession><AdminLayout /></RequireSession>}>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="pedidos/:id" element={<OrderDetail />} />
        <Route path="productos" element={<Products />} />
        <Route path="productos/nuevo" element={<ProductEditor />} />
        <Route path="productos/:id" element={<ProductEditor />} />
        <Route path="capacitaciones" element={<Seminars />} />
        <Route path="capacitaciones/nueva" element={<SeminarEditor />} />
        <Route path="capacitaciones/:id" element={<SeminarEditor />} />
        <Route path="distribuidores" element={<Distributors />} />
        <Route path="cupones" element={<Coupons />} />
        <Route path="resenas" element={<Reviews />} />
        <Route path="mensajes" element={<Messages />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
