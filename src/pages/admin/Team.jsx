import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UserPlus, KeyRound, Power, Crown } from 'lucide-react'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { useAdminSession } from '../../store/adminSession'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { Input } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { PasswordInput } from '../../components/molecules/PasswordInput'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const lastSeen = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function NewMember({ mutate, onDone }) {
  const empty = { name: '', email: '', password: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await mutate('/admin/team', { method: 'POST', body: form })
      toast(`Cuenta creada. Pásale a ${form.name.split(' ')[0]} su correo y la clave temporal.`)
      setForm(empty)
      onDone()
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card>
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><UserPlus size={18} aria-hidden="true" /> Agregar persona</h2>
      <p className="mt-1 text-sm text-muted">Entra con esta clave temporal y el panel le pide crear una propia.</p>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-start">
        <Field label="Nombre" error={errors.name}><Input value={form.name} onChange={set('name')} autoComplete="off" /></Field>
        <Field label="Correo" error={errors.email}><Input type="email" value={form.email} onChange={set('email')} autoComplete="off" /></Field>
        <Field label="Clave temporal" error={errors.password} hint="Mín. 10, letras y números"><PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <div className="sm:col-span-3"><Button type="submit" loading={saving}>Crear cuenta</Button></div>
      </form>
    </Card>
  )
}

function Member({ member, isMe, mutate, onChange, onTransferred }) {
  const [resetting, setResetting] = useState(false)
  const [temp, setTemp] = useState('')
  const [confirmOwner, setConfirmOwner] = useState(false)
  async function patch(body, message) {
    try {
      await mutate(`/admin/team/${member.id}`, { method: 'PATCH', body })
      toast(message)
      setResetting(false)
      setTemp('')
      if (body.makeOwner) onTransferred()
      else onChange()
    } catch (err) {
      toast(err.message, 'error')
    }
  }
  const canManage = !isMe && member.role !== 'owner'
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ink font-display font-bold text-paper" aria-hidden="true">{(member.name || member.email).charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {member.name}
            {member.role === 'owner' && <Badge tone="gold">Dueño</Badge>}
            {!member.isActive && <Badge tone="danger">Desactivada</Badge>}
            {member.mustChangePassword && member.isActive && <Badge tone="warning">Clave temporal</Badge>}
          </p>
          <p className="truncate text-sm text-muted">{member.email} · {member.lastLoginAt ? `último ingreso ${lastSeen.format(new Date(member.lastLoginAt))}` : 'aún no ingresa'}</p>
        </div>
      </div>
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setResetting((r) => !r)} aria-expanded={resetting}><KeyRound size={14} aria-hidden="true" /> Clave temporal</Button>
          {member.isActive && (
            <Button size="sm" variant="secondary" onClick={() => setConfirmOwner(true)}><Crown size={14} aria-hidden="true" /> Hacer dueño</Button>
          )}
          <Button size="sm" variant="ghost" className={member.isActive ? 'text-danger' : ''} onClick={() => patch({ isActive: !member.isActive }, member.isActive ? 'Cuenta desactivada' : 'Cuenta reactivada')}>
            <Power size={14} aria-hidden="true" /> {member.isActive ? 'Desactivar' : 'Reactivar'}
          </Button>
        </div>
      )}
      {confirmOwner && (
        <div className="flex w-full flex-col gap-3 rounded-2xl bg-warning/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p><strong>{member.name}</strong> pasará a ser dueño de la tienda y tú quedarás como administrador. Solo el dueño gestiona el equipo.</p>
          <div className="flex flex-none gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirmOwner(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => patch({ makeOwner: true }, `${member.name} ahora es el dueño de la tienda`)}>Confirmar traspaso</Button>
          </div>
        </div>
      )}
      {resetting && (
        <form
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-start"
          onSubmit={(e) => {
            e.preventDefault()
            void patch({ password: temp }, 'Clave temporal asignada. Sus sesiones abiertas se cerraron.')
          }}
        >
          <div className="min-w-0 flex-1">
            <PasswordInput value={temp} onChange={(e) => setTemp(e.target.value)} autoComplete="new-password" aria-label={`Clave temporal para ${member.name}`} placeholder="Mín. 10, con letras y números" autoFocus />
          </div>
          <Button type="submit" disabled={temp.length < 10}>Asignar</Button>
        </form>
      )}
    </li>
  )
}

// Equipo: quién puede entrar al panel. Solo el dueño lo administra.
export default function Team() {
  const me = useAdminSession((s) => s.user)
  const setUser = useAdminSession((s) => s.setUser)
  const { data, error, loading, reload, mutate } = useAdminData(me?.role === 'owner' ? '/admin/team' : null)
  // Tras traspasar, la sesión pasa a rol administrador y esta página ya no aplica.
  const afterTransfer = () => mutate('/admin/session').then((r) => setUser(r.user))
  if (me && me.role !== 'owner') return <Navigate to="/admin" replace />
  return (
    <AdminPage title="Equipo" description="Personas con acceso al panel. Cada una entra con su propio correo y contraseña.">
      <div className="grid gap-6">
        <Card>
          {error ? <ErrorState message={error.message} onRetry={reload} /> : loading && !data ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
          ) : (
            <ul className="divide-y divide-sand">{data.map((m) => <Member key={m.id} member={m} isMe={m.id === me.id} mutate={mutate} onChange={reload} onTransferred={afterTransfer} />)}</ul>
          )}
        </Card>
        <NewMember mutate={mutate} onDone={reload} />
      </div>
    </AdminPage>
  )
}
