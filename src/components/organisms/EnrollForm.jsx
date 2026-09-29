import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { enrollmentSchema } from '@shared/seminars.js'
import { fieldErrors } from '@shared/checkoutSchema.js'
import { formatRut } from '@shared/rut.js'
import { formatCLP } from '@shared/pricing.js'
import { api } from '../../lib/api'
import { Button } from '../atoms/Button'
import { Input, Textarea } from '../atoms/Input'
import { Field } from '../molecules/Field'

const empty = { name: '', email: '', phone: '', business: '', rut: '', notes: '' }

// Inscripción a una capacitación: con valor definido paga en Mercado Pago; sin valor, pre-inscribe.
export function EnrollForm({ seminar, disabled }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dashu-checkout-profile') || '{}')
      return { ...empty, name: saved.name || '', email: saved.email || '', phone: saved.phone || '' }
    } catch {
      return empty
    }
  })
  const [errors, setErrors] = useState({})
  const [state, setState] = useState({ sending: false, error: '' })
  const preRegistration = seminar.price === null
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    const parsed = enrollmentSchema.safeParse(form)
    if (!parsed.success) {
      const found = fieldErrors(parsed.error)
      setErrors(found)
      document.querySelector(`[name="enroll-${Object.keys(found)[0]}"]`)?.focus()
      return
    }
    setState({ sending: true, error: '' })
    try {
      const r = await api(`/seminars/${seminar.slug}/enroll`, { method: 'POST', body: form })
      if (r.redirectUrl) window.location.assign(r.redirectUrl)
      else navigate(`/inscripcion/${r.code}?t=${r.token}`)
    } catch (error) {
      setErrors(error.fields || {})
      setState({ sending: false, error: error.message })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre y apellido" error={errors.name} className="sm:col-span-2">
          <Input name="enroll-name" value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email} hint="Aquí te llega la confirmación">
          <Input name="enroll-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="WhatsApp / teléfono" error={errors.phone}>
          <Input name="enroll-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+56 9 1234 5678" />
        </Field>
        <Field label="Barbería o lugar de trabajo" optional error={errors.business}>
          <Input name="enroll-business" value={form.business} onChange={set('business')} autoComplete="organization" />
        </Field>
        <Field label="RUT" optional error={errors.rut}>
          <Input name="enroll-rut" value={form.rut} onChange={set('rut')} onBlur={() => form.rut && setForm((f) => ({ ...f, rut: formatRut(f.rut) }))} placeholder="12.345.678-9" />
        </Field>
        <Field label="Comentario" optional className="sm:col-span-2">
          <Textarea name="enroll-notes" value={form.notes} onChange={set('notes')} maxLength={300} className="min-h-[72px]" placeholder="¿Algo que debamos saber?" />
        </Field>
      </div>
      {state.error && <p className="rounded-2xl bg-danger/10 p-4 text-sm text-danger" role="alert">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={state.sending} disabled={disabled}>
        {preRegistration ? 'Pre-inscribirme' : `Pagar ${formatCLP(seminar.price)} y reservar mi cupo`}
      </Button>
      <p className="flex items-start gap-2 text-xs text-muted">
        <Lock size={13} className="mt-0.5 flex-none" aria-hidden="true" />
        {preRegistration
          ? 'La pre-inscripción no tiene costo. Te avisaremos cuando se confirme el valor para asegurar tu cupo.'
          : 'Pagas en Mercado Pago. Tu cupo queda reservado mientras completas el pago.'}
      </p>
    </form>
  )
}
