import { useState } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, ExternalLink } from 'lucide-react'
import { api } from '../../lib/api'
import { useAdminSession } from '../../store/adminSession'
import { Logo } from '../atoms/Logo'
import { Toaster } from '../organisms/Chrome'
import { SidebarNav, MobileTabs } from '../organisms/admin/AdminNav'

// Mantiene el contenido de la ruta que sale mientras se desvanece.
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

const iconButton = 'grid h-10 w-10 place-items-center rounded-full text-paper/70 transition-colors duration-200 hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

function Avatar({ user, size = 'h-9 w-9' }) {
  return (
    <span className={`grid flex-none place-items-center rounded-full bg-gold font-display font-bold text-ink ${size}`} aria-hidden="true">
      {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
    </span>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAdminSession((s) => s.user)
  const setUser = useAdminSession((s) => s.setUser)

  async function logout() {
    await api('/admin/session', { method: 'DELETE' }).catch(() => null)
    setUser(null)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bone lg:grid lg:grid-cols-[248px_1fr]">
      {/* Escritorio: menú lateral agrupado + persona conectada */}
      <aside className="hidden flex-col gap-6 bg-ink p-5 text-paper lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="px-3 pt-2"><Logo tone="light" /><p className="mt-2 font-mono text-2xs uppercase tracking-[0.18em] text-paper/40">Panel</p></div>
        <div className="scrollbar-none -mx-1 flex-1 overflow-y-auto px-1">
          <SidebarNav />
        </div>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link to="/admin/cuenta" className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <Avatar user={user} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium">{user?.name || 'Mi cuenta'}</span>
              <span className="block truncate text-xs text-paper/45">{user?.email}</span>
            </span>
          </Link>
          <div className="flex gap-1 px-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs text-paper/70 transition-colors duration-200 hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ExternalLink size={15} aria-hidden="true" /> Ver tienda</a>
            <button type="button" onClick={logout} className={`${iconButton} ml-auto`} aria-label="Cerrar sesión"><LogOut size={16} aria-hidden="true" /></button>
          </div>
        </div>
      </aside>

      {/* Celular y tablet: encabezado + barra horizontal deslizable, ambos fijos arriba */}
      <header className="sticky top-0 z-40 bg-ink text-paper lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo tone="light" />
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="Ver tienda"><ExternalLink size={17} aria-hidden="true" /></a>
            <Link to="/admin/cuenta" className="grid h-10 w-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Mi cuenta"><Avatar user={user} size="h-8 w-8" /></Link>
            <button type="button" onClick={logout} className={iconButton} aria-label="Cerrar sesión"><LogOut size={17} aria-hidden="true" /></button>
          </div>
        </div>
        <MobileTabs />
      </header>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <FrozenOutlet />
          </motion.div>
        </AnimatePresence>
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
