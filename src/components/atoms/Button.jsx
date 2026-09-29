import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 ' +
  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2'

const variants = {
  primary: 'bg-ink text-paper shadow-sm hover:bg-navy-700 hover:shadow-md',
  gold: 'bg-gold text-ink shadow-sm hover:bg-gold-light hover:shadow-md',
  secondary: 'border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]',
  inverse: 'bg-paper text-ink hover:bg-white hover:shadow-md',
  outlineLight: 'border border-white/25 text-white hover:border-white/60 hover:bg-white/5',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-[0.95rem]',
  icon: 'h-10 w-10',
}

export function Button({ variant = 'primary', size = 'md', to, href, loading = false, disabled, className = '', children, ref, ...props }) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>
  return (
    <button ref={ref} type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
}
