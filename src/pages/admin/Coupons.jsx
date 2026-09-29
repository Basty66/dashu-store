import { useState } from 'react'
import { Ticket, Trash2, Pencil } from 'lucide-react'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Badge } from '../../components/atoms/Badge'
import { Input, Select } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { ErrorState, EmptyState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const empty = { code: '', type: 'percentage', value: '', minTotal: '', maxUses: '', expiresAt: '', isActive: true }

export default function Coupons() {
  const { data: coupons, error, loading, reload, mutate } = useAdminData('/admin/coupons')
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const body = {
      ...form,
      value: Number(form.value),
      minTotal: Number(form.minTotal) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    }
    try {
      await mutate(editing ? `/admin/coupons/${editing}` : '/admin/coupons', { method: editing ? 'PATCH' : 'POST', body })
      toast(editing ? 'Cupón actualizado' : 'Cupón creado')
      setForm(empty)
      setEditing(null)
      reload()
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(c) {
    await mutate(`/admin/coupons/${c.id}`, { method: 'PATCH', body: { isActive: !c.isActive } }).catch((e) => toast(e.message, 'error'))
    reload()
  }

  async function remove(c) {
    if (!window.confirm(`¿Eliminar el cupón ${c.code}?`)) return
    await mutate(`/admin/coupons/${c.id}`, { method: 'DELETE' }).catch((e) => toast(e.message, 'error'))
    reload()
  }

  return (
    <AdminPage title="Cupones" description="Descuentos por porcentaje o monto fijo, sobre el subtotal de productos.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {loading && !coupons ? (
            <Skeleton className="h-40" />
          ) : error ? (
            <ErrorState message={error.message} onRetry={reload} className="border-0" />
          ) : coupons.length === 0 ? (
            <EmptyState icon={Ticket} title="Aún no hay cupones" message="Crea uno para campañas o clientes mayoristas." />
          ) : (
            <ul className="divide-y divide-sand">
              {coupons.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-mono font-medium">{c.code} {!c.isActive && <Badge tone="warning">Pausado</Badge>}</p>
                    <p className="text-sm text-muted">
                      {c.type === 'percentage' ? `${c.value}% de descuento` : `${formatCLP(c.value)} de descuento`}
                      {c.minTotal > 0 && ` · desde ${formatCLP(c.minTotal)}`}
                      {c.expiresAt && ` · vence ${new Date(c.expiresAt).toLocaleDateString('es-CL')}`}
                    </p>
                    <p className="text-xs text-muted">Usado {c.usedCount}{c.maxUses ? ` de ${c.maxUses}` : ''} {c.usedCount === 1 ? 'vez' : 'veces'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => toggle(c)}>{c.isActive ? 'Pausar' : 'Activar'}</Button>
                    <button type="button" className="rounded-full p-2 hover:bg-ink/5" aria-label={`Editar ${c.code}`} onClick={() => { setEditing(c.id); setForm({ ...c, minTotal: c.minTotal || '', maxUses: c.maxUses || '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' }) }}><Pencil size={15} /></button>
                    <button type="button" className="rounded-full p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Eliminar ${c.code}`} onClick={() => remove(c)}><Trash2 size={15} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <form onSubmit={save} className="space-y-4" noValidate>
            <h2 className="font-display text-lg font-bold">{editing ? 'Editar cupón' : 'Nuevo cupón'}</h2>
            <Field label="Código" error={errors.code}><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} disabled={Boolean(editing)} className="font-mono uppercase" placeholder="BARBERIA10" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo"><Select value={form.type} onChange={set('type')}><option value="percentage">Porcentaje</option><option value="fixed">Monto fijo</option></Select></Field>
              <Field label={form.type === 'percentage' ? 'Porcentaje' : 'Monto CLP'} error={errors.value}><Input type="number" min={1} value={form.value} onChange={set('value')} /></Field>
            </div>
            <Field label="Compra mínima (CLP)" optional><Input type="number" min={0} value={form.minTotal} onChange={set('minTotal')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Usos máximos" optional><Input type="number" min={1} value={form.maxUses} onChange={set('maxUses')} /></Field>
              <Field label="Vence" optional><Input type="date" value={form.expiresAt} onChange={set('expiresAt')} /></Field>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} disabled={!form.code || !form.value}>{editing ? 'Guardar' : 'Crear cupón'}</Button>
              {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty) }}>Cancelar</Button>}
            </div>
          </form>
        </Card>
      </div>
    </AdminPage>
  )
}
