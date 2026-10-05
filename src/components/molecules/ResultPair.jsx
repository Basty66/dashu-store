import { smallImage } from '../../lib/responsiveImage'

// Par de fotos antes/después, una al lado de la otra (tarjetas del carrusel 360).
export function ResultPair({ item }) {
  return (
    <div className="flex h-full gap-2 sm:gap-4">
      {[['Antes', item.before], ['Después', item.after]].map(([label, src]) => (
        <figure key={label} className="relative h-full flex-1 overflow-hidden rounded-2xl bg-sand shadow-lift sm:rounded-3xl">
          <img src={smallImage(src)} alt={`${label}${item.caption ? `: ${item.caption}` : ''}`} className="h-full w-full object-cover" loading="lazy" draggable="false" />
          <figcaption
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-mono text-2xs uppercase tracking-[0.14em] backdrop-blur sm:left-4 sm:top-4 ${label === 'Antes' ? 'bg-ink/60 text-paper' : 'bg-paper/85 text-ink'}`}
          >
            {label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
