import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react'
import { instagramHandle } from '@shared/storeConfig.js'
import { useConfig } from '../../store/storeConfig'
import { Button } from '../atoms/Button'
import { ReelCard } from '../molecules/ReelCard'
import { ReelPlayer } from './ReelPlayer'

const ease = [0.16, 1, 0.3, 1]

function FollowButton({ href, handle, variant = 'primary', className = '' }) {
  return (
    <Button href={href} target="_blank" rel="noopener noreferrer" variant={variant} className={className}>
      <Instagram size={16} aria-hidden="true" /> Seguir {handle}
    </Button>
  )
}

// Reels de Tomás (Admin → Ajustes) en carrusel + llamado a seguir la cuenta de Instagram.
// Sin reels cargados queda solo el llamado a seguir.
export function InstagramReels() {
  const reels = useConfig((c) => c.reels)
  const profile = useConfig((c) => c.social.instagram)
  const [playing, setPlaying] = useState(null)
  const track = useRef(null)
  const close = useCallback(() => setPlaying(null), [])
  const handle = instagramHandle(profile) || 'en Instagram'

  if (!reels.length && !profile) return null

  const scroll = (dir) => {
    const el = track.current
    el?.scrollBy({ left: dir * (el.firstElementChild?.offsetWidth || 240) * 1.05, behavior: 'smooth' })
  }

  if (!reels.length) {
    return (
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-sand bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-4xl sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white" aria-hidden="true">
            <Instagram size={22} />
          </span>
          <div>
            <p className="font-display text-xl font-bold">Mira la técnica en acción</p>
            <p className="text-sm text-muted">Tutoriales, resultados y capacitaciones en {handle}.</p>
          </div>
        </div>
        {profile && <FollowButton href={profile} handle={handle} className="w-full sm:w-auto" />}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold-deep">Resultados reales</p>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Mira la técnica en acción</h3>
        </div>
        <div className="flex items-center gap-2">
          {reels.length > 2 && (
            <div className="hidden gap-2 md:flex">
              <button type="button" onClick={() => scroll(-1)} aria-label="Videos anteriores" className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 transition-all duration-200 hover:border-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ChevronLeft size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => scroll(1)} aria-label="Videos siguientes" className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 transition-all duration-200 hover:border-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
          )}
          {profile && <FollowButton href={profile} handle={handle} variant="secondary" className="hidden sm:inline-flex" />}
        </div>
      </div>

      <ul ref={track} className="scrollbar-none -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0 sm:gap-4">
        {reels.map((reel, i) => (
          <motion.li
            key={reel.url}
            className="w-[62%] flex-none snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06, ease }}
          >
            <ReelCard reel={reel} index={i} onPlay={() => setPlaying(reel)} />
          </motion.li>
        ))}
      </ul>
      {profile && <FollowButton href={profile} handle={handle} className="mt-6 w-full sm:hidden" />}
      <ReelPlayer reel={playing} onClose={close} />
    </div>
  )
}
