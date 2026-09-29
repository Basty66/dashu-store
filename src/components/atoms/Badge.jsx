const tones = {
  neutral: 'bg-ink/[0.06] text-ink',
  gold: 'bg-gold/15 text-gold-deep',
  goldSolid: 'bg-gold text-ink',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-navy/10 text-navy',
  dark: 'bg-ink text-paper',
  light: 'bg-white/10 text-white ring-1 ring-inset ring-white/15',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-2xs font-medium uppercase tracking-[0.08em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
