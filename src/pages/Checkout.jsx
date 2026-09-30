import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Lock, AlertCircle, ChevronDown } from 'lucide-react'
import { REGION_NAMES, communesOf } from '@shared/chile.js'
import { checkoutSchema, fieldErrors } from '@shared/checkoutSchema.js'
import { formatRut } from '@shared/rut.js'
import { formatCLP } from '@shared/pricing.js'
import { useCart } from '../store/cart'
import { useQuote } from '../hooks/useQuote'
import { useSeo } from '../hooks/useSeo'
import { api } from '../lib/api'
import { whatsappLink } from '../lib/contact'
import { Button } from '../components/atoms/Button'
import { Input, Select, Textarea } from '../components/atoms/Input'
import { Field } from '../components/molecules/Field'
import { EmptyState } from '../components/molecules/Feedback'
import { TrustBadges } from '../components/molecules/TrustBadges'
import { CheckoutSummary } from '../components/organisms/CheckoutSummary'
import { MobileStickyBar } from '../components/organisms/MobileStickyBar'

const PROFILE_KEY = 'dashu-checkout-profile'
const emptyForm = { name: '', email: '', phone: '', region: '', commune: '', address: '', notes: '', documentType: 'boleta', rut: '', businessName: '', businessActivity: '' }

function loadProfile() {
  try {
    return { ...emptyForm, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'), notes: '' }
  } catch {
    return emptyForm
  }
}

function Step({ n, title, children }) {
  return (
    <section className="rounded-3xl border border-sand bg-paper p-5 sm:rounded-4xl sm:p-8" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-3 font-display text-xl font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-mono text-sm font-medium text-paper">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function Checkout() {
  useSeo({ title: 'Checkout' })
  const items = useCart((s) => s.items)
  const clearCart = useCart((s) => s.clear)
  const [form, setForm] = useState(loadProfile)
  const [coupon, setCoupon] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const { quote, loading } = useQuote({ region: form.region, couponCode: coupon })
  const communes = useMemo(() => communesOf(form.region), [form.region])

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value, ...(key === 'region' ? { commune: '' } : {}) }))
    if (errors[`customer.${key}`]) setErrors((err) => ({ ...err, [`customer.${key}`]: undefined }))
  }
  const err = (key) => errors[`customer.${key}`]

  if (!items.length) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={ShoppingBag} title="Tu carrito está vacío" message="Agrega un pack para continuar con la compra." action={<Button to="/#comprar" className="mt-2">Ver formatos</Button>} />
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    const payload = {
      items: items.map(({ productId, packUnits, quantity }) => ({ productId, packUnits, quantity })),
      customer: form,
      couponCode: coupon,
    }
    const parsed = checkoutSchema.safeParse(payload)
    if (!parsed.success) {
      const found = fieldErrors(parsed.error)
      setErrors(found)
      const first = Object.keys(found).find((k) => k.startsWith('customer.'))
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    setSubmitting(true)
    try {
      const { orderNumber, token, redirectUrl } = await api('/checkout/create', { method: 'POST', body: payload })
      const { notes: _notes, ...profile } = form
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
        localStorage.setItem('dashu-last-order', JSON.stringify({ orderNumber, token }))
      } catch { /* almacenamiento no disponible */ }
      clearCart()
      window.location.assign(redirectUrl)
    } catch (error) {
      setSubmitting(false)
      setErrors(error.fields || {})
      setFormError(error.problems?.length ? error.problems.map((p) => p.error).join(' · ') : error.message)
    }
  }

  const blocked = quote?.problems?.length > 0 || (coupon && quote?.couponError)
  const paymentsOff = quote && quote.paymentsEnabled === false
  const wa = whatsappLink('Hola, quiero completar una compra en DASHU STORE')

  return (
    <div className="container-x py-8 sm:py-10 lg:py-14">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-10 sm:gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Checkout seguro</p>
          <h1 className="display-lg mt-2">Finaliza tu compra</h1>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted"><Lock size={15} aria-hidden="true" /> Pagas en Mercado Pago. No guardamos datos de tarjetas.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
        {/* Celular: resumen desplegable arriba, con el total siempre visible (estilo Shopify). */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setShowSummary((v) => !v)}
            aria-expanded={showSummary}
            className="flex w-full items-center justify-between gap-3 rounded-3xl border border-sand bg-paper px-5 py-4 text-left transition-colors active:bg-bone"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <ShoppingBag size={16} className="text-gold-deep" aria-hidden="true" />
              {showSummary ? 'Ocultar resumen' : 'Ver resumen del pedido'}
              <ChevronDown size={16} className={`transition-transform duration-300 ${showSummary ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tabular">{formatCLP(quote?.total ?? items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}</span>
          </button>
          <AnimatePresence initial={false}>
            {showSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <CheckoutSummary
              items={items}
              quote={quote}
              loading={loading}
              coupon={coupon}
              onApplyCoupon={setCoupon}
              onRemoveCoupon={() => setCoupon(null)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form id="checkout-form" onSubmit={submit} noValidate className="space-y-4 sm:space-y-6 lg:col-span-7">
          <Step n={1} title="Tus datos">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre y apellido" error={err('name')} className="sm:col-span-2">
                <Input name="customer.name" value={form.name} onChange={set('name')} autoComplete="name" />
              </Field>
              <Field label="Email" error={err('email')} hint="Aquí te enviamos la confirmación y el seguimiento.">
                <Input name="customer.email" type="email" inputMode="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
              <Field label="Teléfono" error={err('phone')}>
                <Input name="customer.phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+56 9 1234 5678" />
              </Field>
            </div>
          </Step>

          <Step n={2} title="Despacho">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Región" error={err('region')}>
                <Select name="customer.region" value={form.region} onChange={set('region')} autoComplete="address-level1">
                  <option value="">Selecciona tu región</option>
                  {REGION_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Comuna" error={err('commune')}>
                <Select name="customer.commune" value={form.commune} onChange={set('commune')} disabled={!form.region} autoComplete="address-level2">
                  <option value="">{form.region ? 'Selecciona tu comuna' : 'Primero elige región'}</option>
                  {communes.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Dirección" error={err('address')} className="sm:col-span-2">
                <Input name="customer.address" value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="Calle, número, depto o local" />
              </Field>
              <Field label="Notas para el despacho" optional className="sm:col-span-2">
                <Textarea name="customer.notes" value={form.notes} onChange={set('notes')} maxLength={300} placeholder="Ej: horario de recepción, dejar en conserjería…" className="min-h-[80px]" />
              </Field>
            </div>
            {quote?.shipping !== undefined && quote?.shipping !== null && (
              <p className="mt-5 rounded-2xl bg-bone px-4 py-3 text-sm">
                Envío a {form.region}: <strong className="tabular">{quote.shipping === 0 ? 'Gratis' : formatCLP(quote.shipping)}</strong>
              </p>
            )}
          </Step>

          <Step n={3} title="Documento tributario">
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de documento">
              {[
                ['boleta', 'Boleta', 'Compra personal'],
                ['factura', 'Factura', 'Para tu empresa o negocio'],
              ].map(([value, label, text]) => (
                <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${form.documentType === value ? 'border-ink ring-1 ring-ink' : 'border-sand-300 hover:border-ink/40'}`}>
                  <input type="radio" className="sr-only" name="documentType" value={value} checked={form.documentType === value} onChange={set('documentType')} />
                  <span className="block font-medium">{label}</span>
                  <span className="block text-xs text-muted">{text}</span>
                </label>
              ))}
            </div>
            {form.documentType === 'factura' && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="RUT empresa" error={err('rut')}>
                  <Input name="customer.rut" value={form.rut} onChange={set('rut')} onBlur={() => form.rut && setForm((f) => ({ ...f, rut: formatRut(f.rut) }))} placeholder="76.123.456-7" />
                </Field>
                <Field label="Razón social" error={err('businessName')}>
                  <Input name="customer.businessName" value={form.businessName} onChange={set('businessName')} autoComplete="organization" />
                </Field>
                <Field label="Giro" error={err('businessActivity')} className="sm:col-span-2">
                  <Input name="customer.businessActivity" value={form.businessActivity} onChange={set('businessActivity')} placeholder="Ej: Peluquería y barbería" />
                </Field>
              </div>
            )}
          </Step>

          <Step n={4} title="Pago">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink bg-white p-4 ring-1 ring-ink">
              <div>
                <p className="font-medium">Mercado Pago</p>
                <p className="text-xs text-muted">Tarjeta de crédito, débito y otros medios de Mercado Pago</p>
              </div>
              <span className="rounded-lg bg-[#00B1EA] px-2.5 py-1 text-xs font-bold text-white">mercado pago</span>
            </div>
            {paymentsOff && (
              <p className="mt-4 flex gap-2 rounded-2xl bg-warning/10 p-4 text-sm text-warning" role="alert">
                <AlertCircle size={16} className="mt-0.5 flex-none" aria-hidden="true" />
                <span>
                  Los pagos en línea están en mantención. {wa ? <a href={wa} className="font-medium underline" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a> : 'Escríbenos'} y te ayudamos a completar tu compra.
                </span>
              </p>
            )}
            {formError && (
              <p className="mt-4 flex gap-2 rounded-2xl bg-danger/10 p-4 text-sm text-danger" role="alert">
                <AlertCircle size={16} className="mt-0.5 flex-none" aria-hidden="true" /> {formError}
              </p>
            )}
            <Button id="pagar" type="submit" size="lg" className="mt-6 w-full" loading={submitting} disabled={Boolean(blocked) || paymentsOff || loading}>
              {submitting ? 'Conectando con Mercado Pago…' : `Pagar ${quote ? formatCLP(quote.total) : ''} con Mercado Pago`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Al pagar aceptas los <a href="/terminos" className="underline">términos y condiciones</a>. Reservamos tu stock mientras completas el pago.
            </p>
          </Step>
        </form>

        <div className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <CheckoutSummary
              items={items}
              quote={quote}
              loading={loading}
              coupon={coupon}
              onApplyCoupon={setCoupon}
              onRemoveCoupon={() => setCoupon(null)}
              />
            </div>
            <div className="rounded-3xl border border-sand p-5 sm:rounded-4xl sm:p-6">
              <TrustBadges stacked />
            </div>
          </div>
        </div>
      </div>

      {/* Celular: total y botón de pago siempre a mano mientras se completa el formulario. */}
      <MobileStickyBar targetId="pagar" mode="before">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs text-muted">Total a pagar</p>
          <p className="font-display text-xl font-bold tabular">{quote ? formatCLP(quote.total) : '—'}</p>
        </div>
        <Button type="submit" form="checkout-form" className="flex-none" loading={submitting} disabled={Boolean(blocked) || paymentsOff || loading}>
          <Lock size={15} aria-hidden="true" /> Pagar
        </Button>
      </MobileStickyBar>
    </div>
  )
}
