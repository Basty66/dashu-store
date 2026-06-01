const MAP = { pending: 0, paid: 1, preparing: 2, dispatched: 3, transit: 4, delivered: 5 }

const steps = [
  { label: 'Recibido', sub: 'Pedido confirmado' },
  { label: 'Preparación', sub: 'Empacando' },
  { label: 'Despachado', sub: 'En ruta' },
  { label: 'En Tránsito', sub: 'Camino a tu domicilio' },
  { label: 'Entregado', sub: '¡Recibido!' },
]

export default function OrderTimeline({ status, trackingNumber }) {
  const cur = MAP[status] ?? 0

  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => {
        const done = i < cur
        const active = i === cur
        return (
          <div key={i} className="flex gap-5 pb-6 last:pb-0 relative">
            <div className="flex flex-col items-center">
              <div className={`relative z-10 w-9 h-9 flex items-center justify-center transition-all ${
                done ? 'bg-soot text-parchment' : active ? 'bg-soot text-parchment' : 'bg-linen text-stone'
              }`}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && <div className={`w-px flex-1 mt-1 ${done || active ? 'bg-soot' : 'bg-linen'}`} />}
            </div>
            <div className="pt-1">
              <p className={`text-sm font-medium ${done || active ? 'text-soot' : 'text-stone'}`}>{s.label}</p>
              <p className="text-xs text-stone/70 mt-0.5">{s.sub}</p>
              {i === 2 && trackingNumber && <p className="text-[11px] text-clay mt-1">N°: {trackingNumber}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
