const statusMap = { pending: 0, paid: 1, preparing: 2, dispatched: 3, transit: 4, delivered: 5 }

const steps = [
  { label: 'Recibido', sub: 'Pedido confirmado', icon: 'inbox' },
  { label: 'Preparación', sub: 'Empacando tu pedido', icon: 'package' },
  { label: 'Despachado', sub: 'En manos del courier', icon: 'truck' },
  { label: 'En Tránsito', sub: 'Rumbo a tu domicilio', icon: 'map-pin' },
  { label: 'Entregado', sub: '¡Recibido con éxito!', icon: 'check-circle' },
]

export default function OrderTimeline({ status, trackingNumber }) {
  const current = statusMap[status] ?? 0

  return (
    <div className="w-full">
      <div className="relative">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current

          return (
            <div key={i} className="flex gap-5 pb-8 last:pb-0 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    done
                      ? 'bg-charcoal text-white'
                      : active
                      ? 'bg-charcoal text-white ring-4 ring-charcoal/10'
                      : 'bg-mist text-slate'
                  }`}
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${done ? 'bg-charcoal' : 'bg-mist'}`} />
                )}
              </div>
              <div className="pt-1.5">
                <p className={`font-display font-semibold text-sm ${done || active ? 'text-charcoal' : 'text-slate'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate mt-0.5">{step.sub}</p>
                {i === 2 && trackingNumber && (
                  <p className="text-xs text-taupe mt-1 font-medium">N° Seguimiento: {trackingNumber}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
