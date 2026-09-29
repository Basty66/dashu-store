import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Download, RefreshCw, UserPlus, MessageCircle, Check, X, ExternalLink, CalendarCheck, AlertTriangle } from 'lucide-react'
import { SEMINAR_KINDS, ENROLLMENT_STATUS } from '@shared/seminars.js'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Badge } from '../../components/atoms/Badge'
import { Input, Select, Textarea } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const blank = {
  title: '', kind: 'seminario', dateKey: '', startTime: '', endTime: '', scheduleNote: '', city: '', venue: '', address: '', host: '',
  summary: '', description: '', price: '', priceTbd: true, capacity: 20, isPublished: true, isCancelled: false,
}
const order = { PAGADO: 0, PENDIENTE_PAGO: 1, PREINSCRITO: 2, EXPIRADO: 3, CANCELADO: 4 }
const date = (d) => new Date(d).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const waNumber = (phone) => {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 9 ? `56${digits}` : digits
}

function toForm(s) {
  return { ...blank, ...s, startTime: s.startTime || '', endTime: s.endTime || '', price: s.price ?? '', priceTbd: s.price === null }
}

function exportCsv(seminar) {
  const rows = [['Código', 'Estado', 'Nombre', 'Email', 'Teléfono', 'RUT', 'Barbería', 'Monto', 'Medio', 'Fecha']]
  for (const e of seminar.enrollments) {
    rows.push([e.code, ENROLLMENT_STATUS[e.status]?.label, e.name, e.email, e.phone, e.rut || '', e.business || '', e.amount, e.paymentMethod || '', new Date(e.createdAt).toLocaleString('es-CL')])
  }
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')
  // BOM para que Excel abra el CSV con tildes correctas.
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff), csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `inscritos-${seminar.slug}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ManualAdd({ seminar, onDone, mutate }) {
  const empty = { name: '', email: '', phone: '', business: '', paid: true, amount: seminar.price ?? '', force: false }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      const updated = await mutate(`/admin/seminars/${seminar.id}/enrollments`, {
        method: 'POST',
        body: { ...form, amount: form.paid ? Number(form.amount) || 0 : 0 },
      })
      toast('Inscrito agregado')
      setForm(empty)
      onDone(updated)
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-2xl border border-dashed border-sand-300 p-4 sm:grid-cols-2">
      <Field label="Nombre" error={errors.name}><Input value={form.name} onChange={set('name')} /></Field>
      <Field label="Email" error={errors.email}><Input type="email" value={form.email} onChange={set('email')} /></Field>
      <Field label="Teléfono" error={errors.phone}><Input type="tel" value={form.phone} onChange={set('phone')} /></Field>
      <Field label="Barbería" optional><Input value={form.business} onChange={set('business')} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.paid} onChange={set('paid')} className="h-4 w-4 accent-[#171210]" /> Pagó (efectivo o transferencia)</label>
      {form.paid && <Field label="Monto pagado (CLP)"><Input type="number" min={0} value={form.amount} onChange={set('amount')} /></Field>}
      {form.paid && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.force} onChange={set('force')} className="h-4 w-4 accent-[#171210]" /> Permitir sobrecupo si está lleno</label>}
      <div className="sm:col-span-2"><Button type="submit" size="sm" loading={busy}><UserPlus size={14} /> Agregar inscrito</Button></div>
    </form>
  )
}

function Attendees({ seminar, setSeminar, mutate }) {
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(null)
  const list = [...seminar.enrollments].sort((a, b) => order[a.status] - order[b.status])
  const count = (status) => seminar.enrollments.filter((e) => e.status === status).length
  const revenue = seminar.enrollments.filter((e) => e.status === 'PAGADO').reduce((s, e) => s + e.amount, 0)

  async function change(e, status) {
    const question = status === 'CANCELADO'
      ? `¿Cancelar la inscripción de ${e.name}? Se libera su cupo. Si pagó por Mercado Pago, el reembolso se hace desde Mercado Pago.`
      : `¿Confirmar el pago de ${e.name}? Se le enviará la confirmación.`
    if (!window.confirm(question)) return
    setBusy(`${e.id}-${status}`)
    try {
      setSeminar(await mutate(`/admin/enrollments/${e.id}`, { method: 'PATCH', body: { status } }))
      toast(status === 'CANCELADO' ? 'Inscripción cancelada' : 'Pago confirmado')
    } catch (err) {
      if (err.status === 409 && status === 'PAGADO' && window.confirm(`${err.message}\n\n¿Confirmar igual con sobrecupo?`)) {
        setSeminar(await mutate(`/admin/enrollments/${e.id}`, { method: 'PATCH', body: { status, force: true } }))
      } else {
        toast(err.message, 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Inscritos</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setAdding((a) => !a)}><UserPlus size={14} /> Agregar a mano</Button>
          <Button size="sm" variant="secondary" onClick={() => exportCsv(seminar)} disabled={!seminar.enrollments.length}><Download size={14} /> Exportar CSV</Button>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Inscritos', `${count('PAGADO')}/${seminar.capacity}`],
          ['Esperando pago', count('PENDIENTE_PAGO')],
          ['Pre-inscritos', count('PREINSCRITO')],
          ['Recaudado', formatCLP(revenue)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-bone p-3">
            <dt className="text-2xs text-muted">{k}</dt>
            <dd className="font-display text-xl font-bold tabular">{v}</dd>
          </div>
        ))}
      </dl>
      {adding && <div className="mt-4"><ManualAdd seminar={seminar} mutate={mutate} onDone={(s) => { setSeminar(s); setAdding(false) }} /></div>}
      {list.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Todavía no hay inscripciones.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-sand text-left font-mono text-2xs uppercase tracking-[0.12em] text-muted">
                <th className="py-2 pr-3 font-medium">Persona</th><th className="px-3 py-2 font-medium">Contacto</th><th className="px-3 py-2 font-medium">Estado</th><th className="px-3 py-2 text-right font-medium">Monto</th><th className="py-2 pl-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className={`border-b border-sand/70 last:border-0 ${['CANCELADO', 'EXPIRADO'].includes(e.status) ? 'opacity-50' : ''}`}>
                  <td className="py-3 pr-3"><span className="block font-medium">{e.name}</span><span className="block text-xs text-muted">{e.business || '—'} · {date(e.createdAt)}</span></td>
                  <td className="px-3 py-3"><span className="block">{e.phone}</span><a href={`mailto:${e.email}`} className="block text-xs text-muted hover:underline">{e.email}</a></td>
                  <td className="px-3 py-3"><Badge tone={ENROLLMENT_STATUS[e.status]?.tone}>{ENROLLMENT_STATUS[e.status]?.label}</Badge>{e.paymentMethod === 'manual' && <span className="ml-1 text-2xs text-muted">manual</span>}</td>
                  <td className="px-3 py-3 text-right font-mono tabular">{e.amount ? formatCLP(e.amount) : '—'}</td>
                  <td className="py-3 pl-3">
                    <div className="flex justify-end gap-1">
                      <a href={`https://wa.me/${waNumber(e.phone)}?text=${encodeURIComponent(`Hola ${e.name.split(' ')[0]}, te escribimos por tu inscripción a "${seminar.title}" (${seminar.city}).`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-success hover:bg-success/10" aria-label={`WhatsApp a ${e.name}`}><MessageCircle size={15} /></a>
                      {['PREINSCRITO', 'PENDIENTE_PAGO', 'EXPIRADO'].includes(e.status) && (
                        <button type="button" onClick={() => change(e, 'PAGADO')} disabled={busy} className="rounded-full p-2 hover:bg-ink/5" aria-label={`Confirmar pago de ${e.name}`} title="Confirmar pago"><Check size={15} /></button>
                      )}
                      {['PREINSCRITO', 'PENDIENTE_PAGO', 'PAGADO'].includes(e.status) && (
                        <button type="button" onClick={() => change(e, 'CANCELADO')} disabled={busy} className="rounded-full p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Cancelar inscripción de ${e.name}`} title="Cancelar"><X size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default function SeminarEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { data, error, loading, reload, mutate, setData } = useAdminData(isNew ? null : `/admin/seminars/${id}`)
  const [form, setForm] = useState(isNew ? blank : null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (data) setForm(toForm(data))
  }, [data])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const body = {
      title: form.title, kind: form.kind, date: form.dateKey, startTime: form.startTime || null, endTime: form.endTime || null,
      scheduleNote: form.scheduleNote, city: form.city, venue: form.venue, address: form.address, host: form.host,
      summary: form.summary, description: form.description, price: form.priceTbd ? null : Number(form.price),
      capacity: Number(form.capacity), isPublished: form.isPublished, isCancelled: form.isCancelled,
      ...(isNew ? {} : { slug: data.slug }),
    }
    try {
      const saved = await mutate(isNew ? '/admin/seminars' : `/admin/seminars/${id}`, { method: isNew ? 'POST' : 'PATCH', body })
      toast('Capacitación guardada')
      if (isNew) navigate(`/admin/capacitaciones/${saved.id}`, { replace: true })
      else setData(saved)
    } catch (err) {
      setErrors(Object.fromEntries(Object.entries(err.fields || {}).map(([k, v]) => [k === 'date' ? 'dateKey' : k, v])))
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function sync() {
    setSyncing(true)
    try {
      setData(await mutate(`/admin/seminars/${id}/sync`, { method: 'POST' }))
      toast('Calendario sincronizado')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function remove() {
    if (!window.confirm('¿Eliminar esta capacitación? Solo es posible si no tiene inscripciones activas.')) return
    try {
      await mutate(`/admin/seminars/${id}`, { method: 'DELETE' })
      toast('Capacitación eliminada')
      navigate('/admin/capacitaciones')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!isNew && error) return <AdminPage title="Capacitación"><ErrorState message={error.message} onRetry={reload} /></AdminPage>
  if (!form || (loading && !isNew && !data)) return <AdminPage title="Capacitación"><Skeleton className="h-96 rounded-3xl" /></AdminPage>

  return (
    <AdminPage
      title={isNew ? 'Nueva capacitación' : form.title}
      description={isNew ? 'Completa los datos y publícala.' : `${form.city} · ${new Date(`${form.dateKey}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      actions={<Button variant="ghost" size="sm" to="/admin/capacitaciones"><ArrowLeft size={15} /> Capacitaciones</Button>}
    >
      <div className="space-y-6">
        {!isNew && data && <Attendees seminar={data} setSeminar={setData} mutate={mutate} />}

        <form onSubmit={save} noValidate className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-5 lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Datos</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre" error={errors.title} className="sm:col-span-2"><Input value={form.title} onChange={set('title')} placeholder="Ej: Seminario de alisado" /></Field>
              <Field label="Tipo">
                <Select value={form.kind} onChange={set('kind')}>{Object.entries(SEMINAR_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
              </Field>
              <Field label="Fecha" error={errors.dateKey}><Input type="date" value={form.dateKey} onChange={set('dateKey')} /></Field>
              <Field label="Hora inicio" optional error={errors.startTime}><Input type="time" value={form.startTime} onChange={set('startTime')} /></Field>
              <Field label="Hora término" optional error={errors.endTime}><Input type="time" value={form.endTime} onChange={set('endTime')} /></Field>
              <Field label="Nota de horario" optional hint="Ej: Bloque AM (se muestra si no hay hora)"><Input value={form.scheduleNote} onChange={set('scheduleNote')} /></Field>
              <Field label="Ciudad" error={errors.city}><Input value={form.city} onChange={set('city')} /></Field>
              <Field label="Lugar" optional hint="Ej: Bemol Barbería"><Input value={form.venue} onChange={set('venue')} /></Field>
              <Field label="Dirección" optional><Input value={form.address} onChange={set('address')} /></Field>
              <Field label="Con / anfitrión" optional hint="Invitados o barbería anfitriona" className="sm:col-span-2"><Input value={form.host} onChange={set('host')} /></Field>
              <Field label="Resumen" optional hint="Una o dos frases para la tarjeta" className="sm:col-span-2"><Textarea value={form.summary} onChange={set('summary')} maxLength={300} className="min-h-[72px]" /></Field>
              <Field label="Descripción" optional hint="Qué se aprende, qué incluye, qué traer" className="sm:col-span-2"><Textarea value={form.description} onChange={set('description')} rows={6} /></Field>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="font-display text-lg font-bold">Valor y cupos</h2>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.priceTbd} onChange={set('priceTbd')} className="mt-0.5 h-4 w-4 accent-[#171210]" />
                <span>Valor por confirmar<span className="block text-xs text-muted">Se reciben pre-inscripciones sin pago.</span></span>
              </label>
              {!form.priceTbd && <Field label="Valor por persona (CLP)" error={errors.price}><Input type="number" min={1} step={1000} value={form.price} onChange={set('price')} /></Field>}
              <Field label="Cupos" error={errors.capacity} hint={!isNew && data ? `${data.seatsTaken} ocupados` : undefined}><Input type="number" min={1} value={form.capacity} onChange={set('capacity')} /></Field>
            </Card>
            <Card className="space-y-4">
              <h2 className="font-display text-lg font-bold">Publicación</h2>
              <label className="flex items-center justify-between gap-3 text-sm"><span>Visible en la web</span><input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="h-5 w-5 accent-[#171210]" /></label>
              <label className="flex items-center justify-between gap-3 text-sm"><span>Cancelada</span><input type="checkbox" checked={form.isCancelled} onChange={set('isCancelled')} className="h-5 w-5 accent-[#171210]" /></label>
              {!isNew && data && (
                <div className="space-y-2 border-t border-sand pt-4 text-sm">
                  {data.calendarError ? (
                    <p className="flex items-start gap-2 text-warning"><AlertTriangle size={15} className="mt-0.5 flex-none" /> {data.calendarError}</p>
                  ) : data.calendarEventId ? (
                    <p className="flex items-center gap-2 text-success"><CalendarCheck size={15} /> Sincronizada con Google Calendar</p>
                  ) : (
                    <p className="text-muted">Aún no está en Google Calendar.</p>
                  )}
                  <Button type="button" size="sm" variant="secondary" onClick={sync} loading={syncing}><RefreshCw size={14} /> Sincronizar calendario</Button>
                  <Button type="button" size="sm" variant="ghost" href={`/capacitaciones/${data.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Ver en la web</Button>
                </div>
              )}
            </Card>
            <div className="flex flex-col gap-3">
              <Button type="submit" size="lg" loading={saving}><Save size={16} /> Guardar</Button>
              {!isNew && <Button variant="ghost" onClick={remove} className="text-danger">Eliminar</Button>}
            </div>
          </div>
        </form>
      </div>
    </AdminPage>
  )
}
