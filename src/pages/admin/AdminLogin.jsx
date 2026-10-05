import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { ShieldCheck, ArrowRight, LockKeyhole } from 'lucide-react'
import { api } from '../../lib/api'
import { useAdminSession } from '../../store/adminSession'
import { Button } from '../../components/atoms/Button'
import { Input } from '../../components/atoms/Input'
import { Logo } from '../../components/atoms/Logo'
import { Field } from '../../components/molecules/Field'
import { PasswordInput } from '../../components/molecules/PasswordInput'

const ease = [0.16, 1, 0.3, 1]

// Panel de marca (solo escritorio).
function BrandPanel() {
  return (
    <div className="grain relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
      <div aria-hidden="true" className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-gold/20 blur-[120px]" />
      <div aria-hidden="true" className="absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-blush/10 blur-[120px]" />
      <Logo tone="light" />
      <div className="relative">
        <p className="eyebrow text-gold">Panel de administración</p>
        <p className="mt-4 max-w-md font-display text-5xl font-black leading-[0.95]" style={{ fontStretch: '115%' }}>
          Tu tienda,{' '}
          <span className="font-serif font-normal italic text-gold" style={{ fontStretch: '100%' }}>bajo control.</span>
        </p>
        <p className="mt-5 max-w-sm text-paper/60">Pedidos, productos, ofertas, capacitaciones y ajustes en un solo lugar.</p>
      </div>
      <p className="relative flex items-center gap-2 text-xs text-paper/45">
        <ShieldCheck size={14} aria-hidden="true" /> Conexión cifrada · la sesión se cierra sola a las 12 horas
      </p>
    </div>
  )
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const reduce = useReducedMotion()
  const setUser = useAdminSession((s) => s.setUser)
  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState({ loading: false, error: '' })
  const shake = useAnimationControls()

  async function submit(e) {
    e.preventDefault()
    setState({ loading: true, error: '' })
    try {
      const { user } = await api('/admin/session', { method: 'POST', body: form })
      setUser(user)
      navigate(user.mustChangePassword ? '/admin/cuenta' : location.state?.from || '/admin', { replace: true })
    } catch (error) {
      setForm((f) => ({ ...f, password: '' }))
      setState({ loading: false, error: error.message })
      if (!reduce) void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } })
    }
  }

  return (
    <div className="grid min-h-screen bg-bone lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel />
      <main className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          className="w-full max-w-sm"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="lg:hidden"><Logo /></div>
          <span className="mt-10 grid h-12 w-12 place-items-center rounded-2xl bg-ink text-gold lg:mt-0" aria-hidden="true">
            <LockKeyhole size={20} />
          </span>
          <h1 className="display-md mt-5">Ingresa al panel</h1>
          <p className="mt-2 text-muted">Usa el correo y la contraseña de tu cuenta.</p>

          <motion.form onSubmit={submit} noValidate className="mt-8 space-y-5" animate={shake}>
            <Field label="Correo">
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} autoComplete="username" inputMode="email" autoFocus required />
            </Field>
            <Field label="Contraseña">
              <PasswordInput value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="current-password" required />
            </Field>
            {state.error && (
              <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger" role="alert">{state.error}</p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={state.loading} disabled={!form.email || !form.password}>
              Ingresar <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </motion.form>

          <p className="mt-8 text-xs leading-relaxed text-muted">
            ¿Olvidaste tu contraseña? Pídele al dueño de la tienda que te asigne una temporal desde <span className="font-medium text-ink">Equipo</span>.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
