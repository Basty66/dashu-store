const MAP = { Pendiente: 0, Pagada: 1, 'En preparación': 2, 'En tránsito': 3, Entregado: 4, Rechazado: -1, Error: -1 }

const steps = [
  { label: 'Orden Recibida', sub: 'Pago confirmado' },
  { label: 'Preparación', sub: 'Empacando tu pedido' },
  { label: 'Entregado a Starken', sub: 'En centro de distribución' },
  { label: 'En Tránsito', sub: 'Camino a tu domicilio' },
  { label: 'Entregado', sub: '¡Recibido con éxito!' },
]

export default function OrderTimeline({ status }) {
  const cur = MAP[status] ?? 0

  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => {
        const done = i < cur
        const active = i === cur
        return (
          <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
            <div className="flex flex-col items-center">
              <div className={`relative z-10 w-7 h-7 flex items-center justify-center transition-all duration-500 ${
                done ? 'bg-navy text-white' : active ? 'bg-navy text-white shadow-lg shadow-navy/15' : 'bg-white/60 backdrop-blur-sm border border-navy/5 text-stone'
              }`}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span className="text-[10px] font-semibold">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-[1.5px] flex-1 mt-1 transition-colors duration-500 ${done || active ? 'bg-navy/15' : 'bg-navy/5'}`} />
              )}
            </div>
            <div className="pt-0.5">
              <p className={`text-sm font-medium transition-colors duration-500 ${done || active ? 'text-navy' : 'text-stone/60'}`}>{s.label}</p>
              <p className={`text-xs mt-0.5 transition-colors duration-500 ${done || active ? 'text-stone/70' : 'text-stone/40'}`}>{s.sub}</p>
              {active && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                  <span className="text-[11px] text-gold/80 font-medium">Actualizando...</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
