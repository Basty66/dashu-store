import { useMemo, useState } from 'react'
import { Package, BadgePercent, Truck, GraduationCap, CheckCircle2, MessageCircle, Info } from 'lucide-react'
import { DISTRIBUTOR, DISTRIBUTOR_MIN_UNITS, DISTRIBUTOR_MIN_TOTAL } from '@shared/store.js'
import { REGION_NAMES } from '@shared/chile.js'
import { distributorLeadSchema } from '@shared/seminars.js'
import { fieldErrors } from '@shared/checkoutSchema.js'
import { formatCLP } from '@shared/pricing.js'
import { formatRut } from '@shared/rut.js'
import { api } from '../lib/api'
import { whatsappLink } from '../lib/contact'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/atoms/Button'
import { Input, Select, Textarea } from '../components/atoms/Input'
import { Field } from '../components/molecules/Field'

const empty = { name: '', email: '', phone: '', business: '', rut: '', region: '', city: '', boxes: DISTRIBUTOR.minBoxes, message: '' }
const requirement = `Para ser distribuidor debes pedir al menos ${DISTRIBUTOR.minBoxes} embalajes 📦 (cada embalaje trae ${DISTRIBUTOR.unitsPerBox} cremas DASHU) por un total de ${formatCLP(DISTRIBUTOR_MIN_TOTAL)}. Cada crema te queda a ${formatCLP(DISTRIBUTOR.unitCost)}.`

function Requirement({ className = '' }) {
  return (
    <div className={`flex gap-3 rounded-3xl bg-blush p-5 text-sm leading-relaxed ${className}`} role="note">
      <Info size={18} className="mt-0.5 flex-none text-gold-deep" aria-hidden="true" />
      <p>{requirement}</p>
    </div>
  )
}

export default function Distributors() {
  useSeo({ title: 'Distribuidores', description: `Vende DASHU Down Permanent en tu negocio: ${DISTRIBUTOR.minBoxes} embalajes de ${DISTRIBUTOR.unitsPerBox} cremas a ${formatCLP(DISTRIBUTOR.unitCost)} c/u.` })
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState({ sending: false, done: null, error: '' })
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }
  const boxes = Math.max(1, Number(form.boxes) || 0)
  const total = boxes * DISTRIBUTOR.unitsPerBox * DISTRIBUTOR.unitCost
  const underMin = boxes < DISTRIBUTOR.minBoxes

  const benefits = useMemo(() => [
    { icon: BadgePercent, title: `${formatCLP(DISTRIBUTOR.unitCost)} por crema`, text: 'El mejor precio, comprando embalajes cerrados.' },
    { icon: Package, title: `${DISTRIBUTOR.unitsPerBox} cremas por embalaje`, text: `Pedido mínimo: ${DISTRIBUTOR.minBoxes} embalajes (${DISTRIBUTOR_MIN_UNITS} cremas).` },
    { icon: Truck, title: 'Despacho a todo Chile', text: 'Con número de seguimiento del courier.' },
    { icon: GraduationCap, title: 'Capacitación', text: 'Accede a seminarios y clases prácticas de la técnica.' },
  ], [])

  async function submit(e) {
    e.preventDefault()
    const parsed = distributorLeadSchema.safeParse(form)
    if (!parsed.success) {
      const found = fieldErrors(parsed.error)
      setErrors(found)
      document.querySelector(`[name="lead-${Object.keys(found)[0]}"]`)?.focus()
      return
    }
    setState({ sending: true, done: null, error: '' })
    try {
      await api('/distributors', { method: 'POST', body: form })
      setState({ sending: false, done: { ...form }, error: '' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setErrors(error.fields || {})
      setState({ sending: false, done: null, error: error.message })
    }
  }

  if (state.done) {
    const d = state.done
    const wa = whatsappLink(`Hola, soy ${d.name} de ${d.business} (${d.city}). Postulé como distribuidor DASHU y quiero pedir ${d.boxes} embalajes.`)
    return (
      <div className="container-x max-w-3xl py-16 lg:py-24">
        <div className="rounded-4xl border border-sand bg-paper p-8 sm:p-10">
          <CheckCircle2 size={40} strokeWidth={1.6} className="text-success" aria-hidden="true" />
          <h1 className="display-md mt-4">¡Recibimos tu solicitud, {d.name.split(' ')[0]}!</h1>
          <p className="mt-3 text-muted">Te enviamos una copia a <strong className="text-ink">{d.email}</strong> y te contactaremos para coordinar tu primer pedido.</p>
          <Requirement className="mt-6" />
          <p className="mt-6 text-sm">
            Tu pedido estimado: <strong>{d.boxes} embalajes</strong> · {Number(d.boxes) * DISTRIBUTOR.unitsPerBox} cremas · <strong className="tabular">{formatCLP(Number(d.boxes) * DISTRIBUTOR.unitsPerBox * DISTRIBUTOR.unitCost)}</strong>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {wa && <Button href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> Adelantar por WhatsApp</Button>}
            <Button variant="secondary" to="/">Volver a la tienda</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy py-16 text-paper lg:py-24">
        <div aria-hidden="true" className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-blush/10 blur-[120px]" />
        <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-gold">Programa de distribuidores</p>
            <h1 className="display-xl mt-4 text-balance">Lleva DASHU a tu barbería o tienda.</h1>
            <p className="mt-6 max-w-xl text-lg text-paper/70">Compra por embalaje cerrado, revende con buen margen y ofrece a tus clientes la solución coreana para el pelo rebelde.</p>
          </div>
          <div className="rounded-4xl bg-paper p-6 text-ink lg:col-span-5">
            <p className="eyebrow text-gold-deep">Pedido mínimo</p>
            <p className="mt-2 font-display text-4xl font-black tabular">{formatCLP(DISTRIBUTOR_MIN_TOTAL)}</p>
            <p className="mt-1 text-sm text-muted">{DISTRIBUTOR.minBoxes} embalajes × {DISTRIBUTOR.unitsPerBox} cremas = {DISTRIBUTOR_MIN_UNITS} cremas a {formatCLP(DISTRIBUTOR.unitCost)} c/u</p>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-4xl border border-sand bg-paper p-6">
              <Icon size={22} className="text-gold-deep" aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-md">Postula como distribuidor</h2>
            <p className="mt-3 text-muted">Completa tus datos y te contactamos para coordinar el pedido, el pago y el despacho.</p>
            <Requirement className="mt-6" />
          </div>
          <form onSubmit={submit} noValidate className="grid gap-5 rounded-4xl border border-sand bg-paper p-6 sm:grid-cols-2 sm:p-8 lg:col-span-8">
            <Field label="Nombre y apellido" error={errors.name}><Input name="lead-name" value={form.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Barbería o negocio" error={errors.business}><Input name="lead-business" value={form.business} onChange={set('business')} autoComplete="organization" /></Field>
            <Field label="Email" error={errors.email}><Input name="lead-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="WhatsApp / teléfono" error={errors.phone}><Input name="lead-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
            <Field label="Región" error={errors.region}>
              <Select name="lead-region" value={form.region} onChange={set('region')}>
                <option value="">Selecciona tu región</option>
                {REGION_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Comuna o ciudad" error={errors.city}><Input name="lead-city" value={form.city} onChange={set('city')} autoComplete="address-level2" /></Field>
            <Field label="RUT (para factura)" optional error={errors.rut}>
              <Input name="lead-rut" value={form.rut} onChange={set('rut')} onBlur={() => form.rut && setForm((f) => ({ ...f, rut: formatRut(f.rut) }))} />
            </Field>
            <Field label="¿Cuántos embalajes quieres?" error={errors.boxes} hint={`${boxes * DISTRIBUTOR.unitsPerBox} cremas · ${formatCLP(total)}`}>
              <Input name="lead-boxes" type="number" min={1} max={100} value={form.boxes} onChange={set('boxes')} />
            </Field>
            {underMin && (
              <p className="rounded-2xl bg-warning/10 p-4 text-sm text-warning sm:col-span-2" role="alert">
                El mínimo para ser distribuidor es de {DISTRIBUTOR.minBoxes} embalajes. Puedes enviar la solicitud igual y te orientamos, o comprar packs en la tienda.
              </p>
            )}
            <Field label="Mensaje" optional className="sm:col-span-2"><Textarea name="lead-message" value={form.message} onChange={set('message')} maxLength={1000} placeholder="Cuéntanos de tu negocio y dónde venderías" /></Field>
            {state.error && <p className="text-sm text-danger sm:col-span-2" role="alert">{state.error}</p>}
            <div className="sm:col-span-2"><Button type="submit" size="lg" loading={state.sending}>Enviar solicitud</Button></div>
          </form>
        </div>
      </section>
    </>
  )
}
