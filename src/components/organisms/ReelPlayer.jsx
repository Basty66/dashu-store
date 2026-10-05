import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import { instagramEmbedUrl } from '@shared/storeConfig.js'
import { useScrollLock } from '../../lib/smoothScroll'

const ease = [0.16, 1, 0.3, 1]

// Reproductor en ventana: carga el reproductor oficial de Instagram solo cuando se abre.
export function ReelPlayer({ reel, onClose }) {
  const closeRef = useRef(null)
  const open = Boolean(reel)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={reel.caption || 'Video de Instagram'}>
          <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
          <motion.div
            className="relative flex w-full max-w-[400px] flex-col gap-3"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between gap-3 text-paper">
              <a href={reel.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-1 py-2 text-sm font-medium underline-offset-4 hover:underline">
                Ver en Instagram <ExternalLink size={14} aria-hidden="true" />
              </a>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar video" className="grid h-11 w-11 place-items-center rounded-full bg-paper/15 transition-all duration-200 hover:bg-paper/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift">
              <div className="skeleton h-[min(78vh,680px)] w-full rounded-none">
                <iframe
                  src={instagramEmbedUrl(reel.url)}
                  title={reel.caption || 'Video de Instagram'}
                  className="h-full w-full border-0 bg-transparent"
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
