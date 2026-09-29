import { STORE } from '@shared/store.js'

export function Logo({ tone = 'dark', className = '' }) {
  const main = tone === 'dark' ? 'text-ink' : 'text-paper'
  return (
    <span className={`inline-flex items-baseline gap-2 leading-none ${className}`} aria-label={STORE.name}>
      <span className={`font-display text-[1.35rem] font-black tracking-[0.12em] ${main}`} style={{ fontStretch: '125%' }}>
        {STORE.wordmark}
      </span>
      <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.32em] text-gold">{STORE.wordmarkSuffix}</span>
    </span>
  )
}
