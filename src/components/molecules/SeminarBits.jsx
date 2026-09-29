import { seminarDayParts, seatsLeft } from '@shared/seminars.js'

// Bloque de fecha estilo calendario: 18 · OCT · sáb
export function DateBlock({ date, tone = 'dark', size = 'md' }) {
  const { day, month, weekday } = seminarDayParts(date)
  const colors = tone === 'dark' ? 'bg-ink text-paper' : tone === 'blush' ? 'bg-blush text-ink' : 'bg-paper text-ink border border-sand'
  const dims = size === 'lg' ? 'h-28 w-24' : 'h-20 w-[4.5rem]'
  return (
    <div className={`flex flex-none flex-col items-center justify-center rounded-2xl ${colors} ${dims}`} aria-hidden="true">
      <span className="font-mono text-2xs uppercase tracking-[0.16em] opacity-70">{weekday}</span>
      <span className={`font-display font-black leading-none ${size === 'lg' ? 'text-5xl' : 'text-3xl'}`} style={{ fontStretch: '115%' }}>{day}</span>
      <span className="font-mono text-2xs uppercase tracking-[0.16em]">{month}</span>
    </div>
  )
}

// Barra de cupos: solo se muestra cuando la capacitación ya tiene valor definido.
export function SeatsBar({ seminar, tone = 'dark' }) {
  if (seminar.price === null) {
    return <p className={`text-sm ${tone === 'dark' ? 'text-muted' : 'text-paper/60'}`}>Cupos limitados · pre-inscripción abierta</p>
  }
  const left = seatsLeft(seminar)
  const pct = Math.min(100, (seminar.seatsTaken / seminar.capacity) * 100)
  const label = left === 0 ? 'Cupos agotados' : left <= 5 ? `¡Quedan ${left} cupos!` : `${left} de ${seminar.capacity} cupos disponibles`
  return (
    <div>
      <p className={`text-sm font-medium ${left <= 5 ? 'text-warning' : tone === 'dark' ? 'text-ink' : 'text-paper'}`}>{label}</p>
      <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${tone === 'dark' ? 'bg-sand' : 'bg-white/15'}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Cupos ocupados">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
