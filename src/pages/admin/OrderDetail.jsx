import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, MessageCircle, Truck, StickyNote, ExternalLink } from 'lucide-react'
import { ADMIN_TRANSITIONS, ORDER_STATUS, statusLabel } from '@shared/orderStatus.js'
import { COURIERS, courierName } from '@shared/shipping.js'
import { formatCLP, packLabelLong } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Input, Select, Textarea } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { ErrorState, StatusBadge } from '../../components/molecules/Feedback'
import { PriceRows } from '../../components/molecules/PriceRows'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const actionStyle = { PAGADO: 'primary', PREPARANDO: 'primary', ENVIADO: 'gold', ENTREGADO: 'primary', CANCELADO: 'secondary' }
const fmt = (d) => new Date(d).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function ShipForm({ order, onSubmit, busy, editing }) {
  const [form, setForm] = useState({ courier: order.courier || 'starken', trackingNumber: order.trackingNumber || '', trackingUrl: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <form
      className="mt-4 space-y-4 rounded-2xl border border-gold/40 bg-gold/[0.06] p-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
    >
      <p className="flex items-center gap-2 text-sm font-medium"><Truck size={16} aria-hidden="true" /> {editing ? 'Actualizar datos del envío' : 'Datos del despacho'}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Courier">
          <Select value={form.courier} onChange={set('courier')}>
            {Object.entries(COURIERS).map(([key, c]) => <option key={key} value={key}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="N° de seguimiento" hint="Ej: orden de flete de Starken">
          <Input value={form.trackingNumber} onChange={set('trackingNumber')} className="font-mono" />
        </Field>
      </div>
      {form.courier === 'otro' && (
        <Field label="Link de seguimiento" optional hint="Debe empezar con https://">
          <Input value={form.trackingUrl} onChange={set('trackingUrl')} placeholder="https://" />
        </Field>
      )}
      <Button type="submit" variant="gold" loading={busy}>{editing ? 'Guardar y avisar al cliente' : 'Marcar como enviado y avisar'}</Button>
    </form>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { data: order, error, loading, reload, mutate, setData } = useAdminData(`/admin/orders/${id}`)
  const [busy, setBusy] = useState(null)
  const [shipping, setShipping] = useState(false)
  const [note, setNote] = useState('')

  async function change(status, extra = {}) {
    if (status === 'CANCELADO' && !window.confirm('¿Cancelar este pedido? Se liberará el stock reservado. Si ya estaba pagado, el reembolso se hace desde Mercado Pago.')) return
    setBusy(status)
    try {
      const updated = await mutate(`/admin/orders/${id}`, { method: 'PATCH', body: { status, ...extra } })
      setData(updated)
      setShipping(false)
      toast(`Pedido actualizado: ${statusLabel(status)}`)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(null)
    }
  }

  async function addNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    try {
      setData(await mutate(`/admin/orders/${id}/notes`, { method: 'POST', body: { note } }))
      setNote('')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading && !order) return <AdminPage title="Pedido"><Skeleton className="h-96 rounded-3xl" /></AdminPage>
  if (error) return <AdminPage title="Pedido"><ErrorState message={error.message} onRetry={reload} /></AdminPage>

  const customerLink = `${window.location.origin}/pedido/${order.orderNumber}?t=${order.accessToken}`
  const phone = order.customerPhone.replace(/\D/g, '')
  const waPhone = phone.length === 9 ? `56${phone}` : phone
  const waText = order.status === 'ENVIADO'
    ? `Hola ${order.customerName.split(' ')[0]}, tu pedido ${order.orderNumber} va en camino con ${courierName(order.courier)}${order.trackingNumber ? ` (N° ${order.trackingNumber})` : ''}. Síguelo aquí: ${customerLink}`
    : `Hola ${order.customerName.split(' ')[0]}, te escribimos por tu pedido ${order.orderNumber} en DASHU STORE. Puedes verlo aquí: ${customerLink}`
  const transitions = (ADMIN_TRANSITIONS[order.status] || []).filter((s) => s !== 'ENVIADO')
  const canShip = ADMIN_TRANSITIONS[order.status]?.includes('ENVIADO') || order.status === 'ENVIADO'

  return (
    <AdminPage
      title={<span className="font-mono">{order.orderNumber}</span>}
      description={`Creado el ${fmt(order.createdAt)}`}
      actions={<Button variant="ghost" size="sm" to="/admin/pedidos"><ArrowLeft size={15} /> Volver</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="text-sm text-muted">Estado</span><StatusBadge status={order.status} /></div>
              {order.paymentStatus && <span className="font-mono text-xs text-muted">Mercado Pago: {order.paymentStatus}{order.mpPaymentId ? ` · #${order.mpPaymentId}` : ''}</span>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {transitions.map((s) => (
                <Button key={s} size="sm" variant={actionStyle[s] || 'secondary'} loading={busy === s} onClick={() => change(s)}>
                  {s === 'PAGADO' ? 'Confirmar pago manual' : s === 'CANCELADO' ? 'Cancelar pedido' : `Marcar: ${ORDER_STATUS[s].label}`}
                </Button>
              ))}
              {canShip && !shipping && (
                <Button size="sm" variant="gold" onClick={() => setShipping(true)}>
                  <Truck size={15} /> {order.status === 'ENVIADO' ? 'Editar envío' : 'Despachar'}
                </Button>
              )}
              {transitions.length === 0 && !canShip && <p className="text-sm text-muted">Este pedido no tiene más acciones.</p>}
            </div>
            {shipping && (
              <ShipForm
                order={order}
                editing={order.status === 'ENVIADO'}
                busy={busy === 'ENVIADO'}
                onSubmit={(form) => change('ENVIADO', { ...form, notify: true })}
              />
            )}
            {order.status === 'ENVIADO' && order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline decoration-gold underline-offset-4">
                Ver seguimiento en {courierName(order.courier)} <ExternalLink size={14} />
              </a>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold">Productos</h2>
            <ul className="mt-3 divide-y divide-sand">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{i.quantity} × {i.title}<span className="block text-xs text-muted">{packLabelLong(i.packUnits)} · {i.packUnits * i.quantity} unidades</span></span>
                  <span className="font-mono tabular">{formatCLP(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3"><PriceRows subtotal={order.subtotal} discount={order.discount} couponCode={order.couponCode} shipping={order.shippingCost} total={order.total} /></div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold">Historial</h2>
            <ol className="mt-4 space-y-4 border-l border-sand pl-5">
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${e.status === 'NOTA_INTERNA' ? 'bg-gold' : 'bg-ink'}`} aria-hidden="true" />
                  <p className="text-sm font-medium">{e.status === 'NOTA_INTERNA' ? 'Nota interna' : statusLabel(e.status)}</p>
                  {e.note && <p className="text-sm text-muted">{e.note}</p>}
                  <p className="text-xs text-muted">{fmt(e.createdAt)}</p>
                </li>
              ))}
            </ol>
            <form onSubmit={addNote} className="mt-5 flex gap-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota interna (el cliente no la ve)" className="min-h-[48px]" rows={1} aria-label="Nota interna" />
              <Button type="submit" variant="secondary" disabled={!note.trim()}><StickyNote size={15} /> Guardar</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg font-bold">Cliente</h2>
            <p className="mt-3 text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-muted"><a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a></p>
            <p className="text-sm text-muted">{order.customerPhone}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</Button>
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(customerLink).then(() => toast('Link de seguimiento copiado'))}><Copy size={14} /> Link cliente</Button>
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-lg font-bold">Despacho</h2>
            <p className="mt-3 text-sm">{order.shippingAddress}</p>
            <p className="text-sm text-muted">{order.shippingCommune}, {order.shippingRegion}</p>
            {order.notes && <p className="mt-3 rounded-xl bg-bone p-3 text-sm">“{order.notes}”</p>}
          </Card>
          <Card>
            <h2 className="font-display text-lg font-bold">Documento</h2>
            {order.documentType === 'factura' ? (
              <dl className="mt-3 space-y-1 text-sm">
                <div><dt className="inline text-muted">Factura · </dt><dd className="inline font-medium">{order.businessName}</dd></div>
                <div><dt className="inline text-muted">RUT: </dt><dd className="inline font-mono">{order.customerRut}</dd></div>
                <div><dt className="inline text-muted">Giro: </dt><dd className="inline">{order.businessActivity}</dd></div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted">Boleta{order.customerRut ? ` · RUT ${order.customerRut}` : ''}</p>
            )}
          </Card>
          <Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Todos los pedidos</Link>
        </div>
      </div>
    </AdminPage>
  )
}
