import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldAlert, Save } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from '../../store/toast'
import { useAdminSession } from '../../store/adminSession'
import { Button } from '../../components/atoms/Button'
import { Input } from '../../components/atoms/Input'
import { Field } from '../../components/molecules/Field'
import { PasswordInput } from '../../components/molecules/PasswordInput'
import { PasswordStrength } from '../../components/molecules/PasswordStrength'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

// Mi cuenta: nombre y contraseña. Al cambiar la clave se cierran las sesiones en otros equipos.
export default function Account() {
  const navigate = useNavigate()
  const user = useAdminSession((s) => s.user)
  const setUser = useAdminSession((s) => s.setUser)
  const forced = Boolean(user?.mustChangePassword)
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const changingPassword = forced || form.newPassword.length > 0

  async function save(e) {
    e.preventDefault()
    if (changingPassword && form.newPassword !== form.confirm) {
      setErrors({ confirm: 'Las contraseñas no coinciden' })
      return
    }
    setSaving(true)
    setErrors({})
    try {
      const body = { name: form.name, ...(changingPassword ? { currentPassword: form.currentPassword, newPassword: form.newPassword } : {}) }
      const updated = await api('/admin/account', { method: 'PATCH', body })
      setUser(updated)
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirm: '' }))
      toast(changingPassword ? 'Contraseña actualizada. Se cerraron tus otras sesiones.' : 'Datos guardados')
      if (forced) navigate('/admin', { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null
  return (
    <AdminPage title="Mi cuenta" description={user.email}>
      {forced && (
        <p className="mb-6 flex gap-3 rounded-3xl bg-warning/10 p-5 text-sm text-warning" role="alert">
          <ShieldAlert size={18} className="mt-0.5 flex-none" aria-hidden="true" />
          Estás usando una contraseña temporal. Crea una propia para seguir usando el panel.
        </p>
      )}
      <form onSubmit={save} noValidate className="grid max-w-3xl gap-6">
        <Card className="space-y-5">
          <h2 className="font-display text-lg font-bold">Tus datos</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" error={errors.name}><Input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Correo" hint="Para cambiarlo, pídeselo al dueño de la tienda."><Input value={user.email} disabled /></Field>
          </div>
        </Card>
        <Card className="space-y-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><KeyRound size={18} aria-hidden="true" /> {forced ? 'Crea tu contraseña' : 'Cambiar contraseña'}</h2>
          <Field label={forced ? 'Contraseña temporal' : 'Contraseña actual'} error={errors.currentPassword}>
            <PasswordInput value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Field label="Nueva contraseña" error={errors.newPassword} hint="Mínimo 10 caracteres, con letras y números.">
                <PasswordInput value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
              </Field>
              <PasswordStrength password={form.newPassword} />
            </div>
            <Field label="Repite la nueva contraseña" error={errors.confirm}>
              <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </Field>
          </div>
        </Card>
        <div><Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto"><Save size={16} aria-hidden="true" /> Guardar</Button></div>
      </form>
    </AdminPage>
  )
}
