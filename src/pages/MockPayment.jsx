import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/atoms/Button'
import { PageShell } from '../components/templates/PageShell'

// SOLO DESARROLLO: reemplaza a Mercado Pago cuando PAYMENTS_MOCK=1 (pedidos e inscripciones).
export default function MockPayment() {
  const [params] = useSearchParams()
  const order = params.get('pedido')
  const enrollment = params.get('inscripcion')
  const token = params.get('t')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function pay(outcome) {
    setBusy(outcome)
    try {
      if (enrollment) {
        await api(`/seminars/inscripcion/${enrollment}/mock-pay`, { method: 'POST', body: { token, outcome } })
        window.location.assign(`/inscripcion/${enrollment}?t=${token}&status=${outcome}`)
      } else {
        await api('/checkout/mock-pay', { method: 'POST', body: { orderNumber: order, token, outcome } })
        window.location.assign(`/pedido/${order}?t=${token}&status=${outcome}`)
      }
    } catch (e) {
      setError(e.message)
      setBusy(null)
    }
  }

  return (
    <PageShell eyebrow="Entorno de pruebas" title="Pago simulado" description={`${enrollment ? `Inscripción ${enrollment}` : `Pedido ${order}`}. Esta pantalla reemplaza a Mercado Pago solo en desarrollo local.`}>
      <div className="flex flex-col gap-4 rounded-4xl border border-dashed border-warning/50 bg-warning/5 p-8">
        <FlaskConical className="text-warning" aria-hidden="true" />
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => pay('approved')} loading={busy === 'approved'}>Aprobar pago</Button>
          <Button variant="secondary" onClick={() => pay('rejected')} loading={busy === 'rejected'}>Rechazar pago</Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </PageShell>
  )
}
