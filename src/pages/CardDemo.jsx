import { useEffect, useState } from 'react'
import { RotateCcw, FlaskConical } from 'lucide-react'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/atoms/Button'
import { Input } from '../components/atoms/Input'
import { Field } from '../components/molecules/Field'
import { ThankYouCard } from '../components/organisms/ThankYouCard'

const kinds = {
  pedido: { code: 'DS-DEMO24', label: 'Down Permanent', message: 'Gracias por tu compra,', note: 'Te avisaremos cuando tu pedido salga a despacho.' },
  capacitacion: { code: 'SEM-DEMO24', label: 'Antofagasta', message: 'Gracias por inscribirte,', note: 'Nos vemos en la capacitación. Agrega la fecha a tu calendario.' },
}

// SOLO LOCAL Y VISTAS PREVIAS DE VERCEL: muestra la tarjeta de agradecimiento sin pagar.
// En la tienda publicada esta ruta no existe (ver App.jsx y vite.config.js).
export default function CardDemo() {
  useSeo({ title: 'Vista previa de la tarjeta' })
  const [name, setName] = useState('Camila')
  const [kind, setKind] = useState('pedido')
  const [run, setRun] = useState(0)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const k = kinds[kind]
  return (
    <div className="container-x max-w-3xl py-10 sm:py-14">
      <p className="mb-8 flex gap-2 rounded-2xl bg-warning/10 p-4 text-sm text-warning">
        <FlaskConical size={16} className="mt-0.5 flex-none" aria-hidden="true" />
        Vista previa: esta página no existe en la tienda publicada. Así se ve la tarjeta después de un pago aprobado.
      </p>

      <ThankYouCard key={run} name={name.trim().split(' ')[0] || 'Camila'} code={k.code} label={k.label} message={k.message} note={k.note} />

      <div className="mx-auto mt-10 grid max-w-md gap-5">
        <Field label="Nombre del cliente">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
        </Field>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de pago">
          {[['pedido', 'Compra'], ['capacitacion', 'Capacitación']].map(([value, text]) => (
            <Button key={value} variant={kind === value ? 'primary' : 'secondary'} aria-pressed={kind === value} onClick={() => { setKind(value); setRun((r) => r + 1) }}>
              {text}
            </Button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => setRun((r) => r + 1)}>
          <RotateCcw size={16} aria-hidden="true" /> Repetir animación
        </Button>
      </div>
    </div>
  )
}
