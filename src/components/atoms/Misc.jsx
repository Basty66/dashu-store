import { useState } from 'react'
import { Star } from 'lucide-react'

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function Eyebrow({ tone = 'gold', className = '', children }) {
  const color = { gold: 'text-gold-deep', light: 'text-gold', muted: 'text-muted' }[tone]
  return <p className={`eyebrow ${color} ${className}`}>{children}</p>
}

export function Stars({ value, size = 14, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? 'fill-gold text-gold' : 'fill-sand text-sand'} aria-hidden="true" />
      ))}
    </span>
  )
}

// Imagen con aspecto fijo (sin saltos de layout) y aparición suave al cargar.
export function Img({ src, alt, ratio = '1 / 1', className = '', imgClassName = '', eager = false, ...props }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
      {!loaded && <div className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        {...props}
      />
    </div>
  )
}
