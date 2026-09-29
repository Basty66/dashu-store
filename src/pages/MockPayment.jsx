import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/atoms/Button'
import { PageShell } from '../components/templates/PageShell'

// SOLO DESARROLLO: reemplaza a Mercado Pago cuando PAYMENTS_MOCK=1 para probar el flujo completo.
export default function MockPayment() {
  const [params] = useSearchParams()
  const orderNumber = params.get('pedido')
  const token = params.get('t')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function pay(outcome) {
    setBusy(outcome)
    try {
      await api('/checkout/mock-pay', { method: 'POST', body: { orderNumber, token, outcome } })
      window.location.assign(`/pedido/${orderNumber}?t=${token}&status=${outcome}`)
    } catch (e) {
      setError(e.message)
      setBusy(null)
    }
  }

  return (
    <PageShell eyebrow="Entorno de pruebas" title="Pago simulado" description={`Pedido ${orderNumber}. Esta pantalla reemplaza a Mercado Pago solo en desarrollo local.`}>
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
