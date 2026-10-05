import { useState } from 'react'
import { Mail, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'
import { useWhatsappNumber, whatsappLink } from '../lib/contact'
import { useConfig } from '../store/storeConfig'
import { Button } from '../components/atoms/Button'
import { Input, Select, Textarea } from '../components/atoms/Input'
import { Field } from '../components/molecules/Field'
import { PageShell } from '../components/templates/PageShell'

const empty = { name: '', email: '', phone: '', subject: 'Consulta sobre productos', message: '' }

export default function Contact() {
  const waNumber = useWhatsappNumber()
  const [form, setForm] = useState(empty)
  const [state, setState] = useState({ sending: false, done: false, error: '', fields: {} })
  const wa = whatsappLink(waNumber)
  const contact = useConfig((c) => c.contact)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setState({ sending: true, done: false, error: '', fields: {} })
    try {
      await api('/contact', { method: 'POST', body: form })
      setState({ sending: false, done: true, error: '', fields: {} })
      setForm(empty)
    } catch (error) {
      setState({ sending: false, done: false, error: error.message, fields: error.fields })
    }
  }

  return (
    <PageShell eyebrow="Contacto" title="Hablemos" description="Consultas, pedidos por volumen o ventas para tu negocio. Te respondemos a la brevedad." width="max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-4">
          {[
            [Mail, 'Email', <a key="m" href={`mailto:${contact.email}`} className="underline decoration-gold underline-offset-4">{contact.email}</a>],
            wa && [MessageCircle, 'WhatsApp', <a key="w" href={wa} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-4">Abrir conversación</a>],
            [Clock, 'Horario', contact.hours],
          ].filter(Boolean).map(([Icon, title, content]) => (
            <div key={title} className="flex gap-4 rounded-3xl border border-sand bg-paper p-5">
              <Icon size={20} className="mt-0.5 text-gold-deep" aria-hidden="true" />
              <div className="text-sm"><p className="font-medium">{title}</p><div className="mt-0.5 text-muted">{content}</div></div>
            </div>
          ))}
        </aside>

        <div className="lg:col-span-8">
          {state.done ? (
            <div className="flex flex-col items-center gap-3 rounded-4xl border border-sand bg-paper p-12 text-center">
              <CheckCircle2 size={36} className="text-success" aria-hidden="true" />
              <p className="font-display text-2xl font-bold">Mensaje enviado</p>
              <p className="text-muted">Te responderemos pronto a tu email.</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setState((s) => ({ ...s, done: false }))}>Enviar otro mensaje</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 rounded-4xl border border-sand bg-paper p-6 sm:grid-cols-2 sm:p-8">
              <Field label="Nombre" error={state.fields.name}><Input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Email" error={state.fields.email}><Input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
              <Field label="Teléfono" optional><Input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
              <Field label="Motivo">
                <Select value={form.subject} onChange={set('subject')}>
                  {['Consulta sobre productos', 'Mi pedido', 'Venta por volumen / mayorista', 'Otro'].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Mensaje" error={state.fields.message} className="sm:col-span-2"><Textarea value={form.message} onChange={set('message')} maxLength={3000} /></Field>
              {state.error && !Object.keys(state.fields).length && <p className="text-sm text-danger sm:col-span-2" role="alert">{state.error}</p>}
              <div className="sm:col-span-2"><Button type="submit" size="lg" loading={state.sending}>Enviar mensaje</Button></div>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  )
}
