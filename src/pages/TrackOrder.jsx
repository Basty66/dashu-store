import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/atoms/Button'
import { Input } from '../components/atoms/Input'
import { Field } from '../components/molecules/Field'
import { PageShell } from '../components/templates/PageShell'

export default function TrackOrder() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ orderNumber: '', email: '' })
  const [state, setState] = useState({ loading: false, error: '' })
  const [last, setLast] = useState(null)

  useEffect(() => {
    try {
      setLast(JSON.parse(localStorage.getItem('dashu-last-order') || 'null'))
    } catch { /* sin acceso a almacenamiento */ }
  }, [])

  async function submit(e) {
    e.preventDefault()
    const orderNumber = form.orderNumber.trim().toUpperCase()
    if (!orderNumber || !form.email.trim()) {
      setState({ loading: false, error: 'Ingresa tu número de pedido y el email de la compra.' })
      return
    }
    setState({ loading: true, error: '' })
    try {
      const order = await api(`/orders/${encodeURIComponent(orderNumber)}`, { method: 'POST', body: { email: form.email } })
      navigate(`/pedido/${order.orderNumber}?t=${order.accessToken}`)
    } catch (error) {
      setState({ loading: false, error: error.message })
    }
  }

  return (
    <PageShell eyebrow="Seguimiento" title="Sigue tu pedido" description="Ingresa el número de pedido (empieza con DS-) y el email con el que compraste.">
      <form onSubmit={submit} noValidate className="space-y-5 rounded-4xl border border-sand bg-paper p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="N° de pedido">
            <Input value={form.orderNumber} onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))} placeholder="DS-XXXXXX" className="font-mono uppercase" autoComplete="off" />
          </Field>
          <Field label="Email de la compra">
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} autoComplete="email" />
          </Field>
        </div>
        {state.error && <p className="text-sm text-danger" role="alert">{state.error}</p>}
        <Button type="submit" size="lg" loading={state.loading} className="w-full sm:w-auto">
          <Search size={16} aria-hidden="true" /> Buscar pedido
        </Button>
      </form>
      {last?.orderNumber && (
        <Button variant="ghost" to={`/pedido/${last.orderNumber}?t=${last.token}`} className="mt-6">
          Ver mi último pedido ({last.orderNumber}) <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </PageShell>
  )
}
