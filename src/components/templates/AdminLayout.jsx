import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Ticket, Star, Mail, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { api } from '../../lib/api'
import { Logo } from '../atoms/Logo'
import { Toaster } from '../organisms/Chrome'

const nav = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/cupones', label: 'Cupones', icon: Ticket },
  { to: '/admin/resenas', label: 'Reseñas', icon: Star },
  { to: '/admin/mensajes', label: 'Mensajes', icon: Mail },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function logout() {
    await api('/admin/session', { method: 'DELETE' }).catch(() => null)
    navigate('/admin/login', { replace: true })
  }

  const links = (
    <nav className="flex flex-col gap-1" aria-label="Administración">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper'}`
          }
        >
          <Icon size={17} aria-hidden="true" /> {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-bone lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden flex-col justify-between bg-ink p-5 text-paper lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div>
          <div className="mb-8 px-3 pt-2"><Logo tone="light" /><p className="mt-2 font-mono text-2xs uppercase tracking-[0.18em] text-paper/40">Panel</p></div>
          {links}
        </div>
        <div className="flex flex-col gap-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-paper/60 hover:bg-white/5 hover:text-paper"><ExternalLink size={17} /> Ver tienda</a>
          <button type="button" onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-paper/60 hover:bg-white/5 hover:text-paper"><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 text-paper lg:hidden">
        <Logo tone="light" />
        <button type="button" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Menú" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && (
        <div className="bg-ink px-4 pb-4 text-paper lg:hidden">
          {links}
          <button type="button" onClick={logout} className="mt-2 flex items-center gap-3 px-3 py-2.5 text-sm text-paper/60"><LogOut size={17} /> Cerrar sesión</button>
        </div>
      )}

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export function AdminPage({ title, description, actions, children }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </div>
  )
}

export function Card({ className = '', children }) {
  return <section className={`rounded-3xl border border-sand bg-paper p-5 sm:p-6 ${className}`}>{children}</section>
}
