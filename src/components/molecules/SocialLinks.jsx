import { Instagram, Facebook, Youtube } from 'lucide-react'
import { useConfig } from '../../store/storeConfig'

// TikTok no viene en lucide: mismo trazo que el resto de los íconos.
function TikTokIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2.4 4.6 5 5" />
    </svg>
  )
}

const NETWORKS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
]

const tones = {
  light: 'border-white/15 text-paper/80 hover:border-white/40 hover:bg-white/10 hover:text-paper',
  dark: 'border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-paper',
}

// Íconos de las redes cargadas en Admin → Ajustes (las vacías no se muestran).
export function SocialLinks({ tone = 'light', className = '' }) {
  const social = useConfig((c) => c.social)
  const links = NETWORKS.filter((n) => social[n.key])
  if (!links.length) return null
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Redes sociales">
      {links.map(({ key, label, icon: Icon }) => (
        <li key={key}>
          <a
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`grid h-11 w-11 place-items-center rounded-full border transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${tones[tone]}`}
          >
            <Icon size={18} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
