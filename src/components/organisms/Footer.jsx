import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import { STORE } from '@shared/store.js'
import { whatsappLink } from '../../lib/contact'
import { Logo } from '../atoms/Logo'

const columns = [
  {
    title: 'Tienda',
    links: [
      { to: '/tienda', label: 'Productos' },
      { to: '/#precios', label: 'Precios por volumen' },
      { to: '/#como-usar', label: 'Cómo se usa' },
      { to: '/capacitaciones', label: 'Capacitaciones' },
      { to: '/distribuidores', label: 'Ser distribuidor' },
      { to: '/#preguntas', label: 'Preguntas frecuentes' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { to: '/seguimiento', label: 'Seguir mi pedido' },
      { to: '/devoluciones', label: 'Cambios y devoluciones' },
      { to: '/terminos', label: 'Términos y condiciones' },
      { to: '/privacidad', label: 'Privacidad' },
    ],
  },
]

export function Footer() {
  const wa = whatsappLink()
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-16 md:grid-cols-12 md:gap-12">
        <div className="col-span-2 md:col-span-5">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
            Crema alisadora de origen coreano para el pelo rebelde. Vendemos por unidad y en packs por volumen, con despacho a todo Chile.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} className="col-span-1 md:col-span-2" aria-label={col.title}>
            <p className="eyebrow text-gold">{col.title}</p>
            <ul className="mt-3 space-y-0.5 sm:mt-4 sm:space-y-1">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="block py-1.5 text-sm text-paper/70 transition-colors hover:text-paper">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 md:col-span-3">
          <p className="eyebrow text-gold">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-paper/70">
            <li className="flex items-center gap-2"><Mail size={15} aria-hidden="true" /><a href={`mailto:${STORE.email}`} className="py-1 hover:text-paper">{STORE.email}</a></li>
            {wa && <li className="flex items-center gap-2"><MessageCircle size={15} aria-hidden="true" /><a href={wa} target="_blank" rel="noopener noreferrer" className="py-1 hover:text-paper">WhatsApp</a></li>}
            <li className="flex items-center gap-2"><Clock size={15} aria-hidden="true" />{STORE.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-paper/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {STORE.name}. Pagos procesados por Mercado Pago.</p>
          <p className="max-w-xl md:text-right">{STORE.legalNotice}</p>
        </div>
      </div>
      <p aria-hidden="true" className="pointer-events-none select-none px-4 pb-2 text-center font-display font-black leading-[0.8] text-white/[0.04]" style={{ fontSize: 'clamp(4rem, 19vw, 17rem)', fontStretch: '125%' }}>
        {STORE.wordmark}
      </p>
    </footer>
  )
}
