import { Play, Instagram } from 'lucide-react'
import { Img } from '../atoms/Misc'

// Tarjeta vertical (9:16) de un reel. Con portada muestra la foto; sin portada, un fondo de marca.
// Al tocarla se abre el reproductor (el video de Instagram se carga recién ahí).
export function ReelCard({ reel, index, onPlay }) {
  const label = reel.caption || `Reel ${index + 1}`
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Ver video: ${label}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-3xl bg-ink text-left text-paper shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lift active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
    >
      {reel.cover ? (
        <Img src={reel.cover} alt="" ratio="9 / 16" className="absolute inset-0" imgClassName="transition-transform duration-700 ease-out group-hover:scale-105" />
      ) : (
        <div aria-hidden="true" className="grain absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-blush/20 blur-3xl" />
          <Instagram size={28} strokeWidth={1.5} className="absolute left-4 top-4 text-paper/70" />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-lift backdrop-blur transition-transform duration-300 ease-out group-hover:scale-110">
        <Play size={22} className="ml-0.5 fill-ink" />
      </span>
      <span className="absolute inset-x-4 bottom-4 line-clamp-2 text-sm font-medium leading-snug">{label}</span>
    </button>
  )
}
