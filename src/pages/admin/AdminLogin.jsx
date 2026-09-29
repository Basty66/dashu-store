import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/atoms/Button'
import { Input } from '../../components/atoms/Input'
import { Logo } from '../../components/atoms/Logo'
import { Field } from '../../components/molecules/Field'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [state, setState] = useState({ loading: false, error: '' })

  async function submit(e) {
    e.preventDefault()
    setState({ loading: true, error: '' })
    try {
      await api('/admin/session', { method: 'POST', body: { password } })
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (error) {
      setState({ loading: false, error: error.message })
    }
  }

  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden bg-navy p-4">
      <div aria-hidden="true" className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold/10 blur-[120px]" />
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-4xl bg-paper p-8 shadow-lift">
        <Logo />
        <div className="mt-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"><Lock size={16} /></span>
          <div>
            <h1 className="font-display text-xl font-bold">Panel de administración</h1>
            <p className="text-sm text-muted">Ingresa tu contraseña</p>
          </div>
        </div>
        <Field label="Contraseña" error={state.error} className="mt-6">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus />
        </Field>
        <Button type="submit" size="lg" className="mt-6 w-full" loading={state.loading} disabled={!password}>Ingresar</Button>
      </form>
    </div>
  )
}
