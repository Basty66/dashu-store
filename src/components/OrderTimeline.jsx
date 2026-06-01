const statusMap = {
  pending: 0,
  paid: 1,
  preparing: 1,
  dispatched: 2,
  transit: 3,
  delivered: 4,
}

const steps = [
  { label: 'Pedido Recibido', icon: 'inventory_2' },
  { label: 'En Preparación', icon: 'inventory' },
  { label: 'Despachado', icon: 'local_shipping' },
  { label: 'En Camino', icon: 'location_on' },
  { label: 'Entregado', icon: 'check_circle' },
]

export default function OrderTimeline({ status, trackingNumber }) {
  const currentStep = statusMap[status] ?? 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-start justify-between">
        {steps.map((step, i) => {
          const isCompleted = i <= currentStep
          const isActive = i === currentStep && status !== 'delivered'

          return (
            <div key={i} className="flex flex-col items-center relative z-10" style={{ flex: '1' }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-navy text-white scale-110 shadow-lg'
                    : isCompleted
                    ? 'bg-navy text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{step.icon}</span>
              </div>
              <p className={`text-xs mt-2 text-center font-medium ${
                isCompleted ? 'text-navy' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
              {trackingNumber && i === 2 && (
                <p className="text-[10px] text-gray-400 mt-0.5">{trackingNumber}</p>
              )}
            </div>
          )
        })}

        <div className="absolute top-5 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
          <div
            className="h-full bg-navy transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          <div className="h-full bg-gray-200" style={{ width: `${100 - (currentStep / (steps.length - 1)) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
