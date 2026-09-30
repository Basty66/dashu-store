import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useScrollLock } from '../../lib/smoothScroll'

// Galería con miniaturas, zoom al pasar el mouse y visor a pantalla completa.
export function ProductGallery({ images, title }) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState(null)
  const count = images.length
  const go = useCallback((delta) => setIndex((i) => (i + delta + count) % count), [count])
  useScrollLock(lightbox)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [lightbox, go])

  if (!count) return <div className="aspect-square rounded-4xl bg-navy" />

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-4xl bg-navy"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 block h-full w-full cursor-zoom-in"
          aria-label={`Ver ${title} en pantalla completa`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={images[index]}
              className="block h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <img
                src={images[index]}
                alt={`${title} — imagen ${index + 1} de ${count}`}
                className="h-full w-full object-cover transition-transform duration-300 ease-out"
                style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: 'scale(1.6)' } : undefined}
                fetchPriority={index === 0 ? 'high' : undefined}
              />
            </motion.span>
          </AnimatePresence>
          <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors group-hover:bg-white/20" aria-hidden="true">
            <Expand size={16} />
          </span>
        </button>
        {count > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(d)
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-card transition-transform hover:scale-105"
                aria-label={d < 0 ? 'Imagen anterior' : 'Imagen siguiente'}
              >
                {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="scrollbar-none flex gap-3 overflow-x-auto" role="tablist" aria-label="Imágenes del producto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`h-20 w-20 flex-none overflow-hidden rounded-2xl bg-navy ring-2 transition-all duration-200 ${i === index ? 'ring-ink' : 'ring-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4 backdrop-blur"
            role="dialog"
            aria-modal="true"
            aria-label={`Imágenes de ${title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.img
              key={images[index]}
              src={images[index]}
              alt={`${title} — imagen ${index + 1}`}
              className="max-h-[88vh] max-w-full rounded-3xl object-contain"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" autoFocus onClick={() => setLightbox(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Cerrar">
              <X size={20} />
            </button>
            {count > 1 && (
              <p className="absolute bottom-6 font-mono text-xs text-white/60">{index + 1} / {count}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
