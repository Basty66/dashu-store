import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingCart, Ticket, Star, Mail, GraduationCap, Store, SlidersHorizontal, Users } from 'lucide-react'
import { useAdminSession } from '../../../store/adminSession'

// Secciones del panel agrupadas por tema. "Equipo" solo lo ve el dueño.
const GROUPS = [
  { title: null, items: [{ to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true }] },
  { title: 'Ventas', items: [{ to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart }, { to: '/admin/cupones', label: 'Cupones', icon: Ticket }] },
  { title: 'Catálogo', items: [{ to: '/admin/productos', label: 'Productos', icon: Package }] },
  {
    title: 'Comunidad',
    items: [
      { to: '/admin/capacitaciones', label: 'Capacitaciones', icon: GraduationCap },
      { to: '/admin/distribuidores', label: 'Distribuidores', icon: Store },
      { to: '/admin/resenas', label: 'Reseñas', icon: Star },
      { to: '/admin/mensajes', label: 'Mensajes', icon: Mail },
    ],
  },
  { title: 'Tienda', items: [{ to: '/admin/ajustes', label: 'Ajustes', icon: SlidersHorizontal }, { to: '/admin/equipo', label: 'Equipo', icon: Users, owner: true }] },
]

function useGroups() {
  const role = useAdminSession((s) => s.user?.role)
  return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.owner || role === 'owner') })).filter((g) => g.items.length)
}

const spring = { type: 'spring', stiffness: 420, damping: 36 }

// Escritorio: lista vertical agrupada.
export function SidebarNav() {
  const groups = useGroups()
  return (
    <nav className="flex flex-col gap-5" aria-label="Administración">
      {groups.map((group) => (
        <div key={group.title || 'inicio'}>
          {group.title && <p className="mb-1.5 px-3 font-mono text-2xs uppercase tracking-[0.16em] text-paper/35">{group.title}</p>}
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `relative isolate flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${isActive ? 'text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper'}`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="admin-pill-desktop" className="absolute inset-0 -z-10 rounded-xl bg-white/10" transition={spring} />}
                      <Icon size={17} aria-hidden="true" /> {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

// Celular y tablet: barra horizontal deslizable; la sección activa se centra sola.
export function MobileTabs() {
  const groups = useGroups()
  const { pathname } = useLocation()
  const track = useRef(null)
  useEffect(() => {
    track.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [pathname])
  return (
    <nav aria-label="Administración" className="relative">
      <ul
        ref={track}
        className="scrollbar-none flex snap-x gap-1.5 overflow-x-auto px-4 pb-3 pt-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)]"
      >
        {groups.flatMap((g) => g.items).map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-none snap-start">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `relative isolate flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${isActive ? 'text-ink' : 'text-paper/70 hover:text-paper'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="admin-pill-mobile" className="absolute inset-0 -z-10 rounded-full bg-paper" transition={spring} />}
                  <Icon size={16} aria-hidden="true" /> {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
