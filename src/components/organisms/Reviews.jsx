import { useEffect, useState } from 'react'
import { Star, MessageSquareQuote } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../atoms/Button'
import { Input, Textarea } from '../atoms/Input'
import { Stars, Skeleton } from '../atoms/Misc'
import { Field } from '../molecules/Field'
import { SectionHeading } from '../molecules/SectionHeading'
import { EmptyState } from '../molecules/Feedback'

function ReviewForm() {
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' })
  const [state, setState] = useState({ sending: false, done: false, error: '', fields: {} })

  async function submit(e) {
    e.preventDefault()
    setState({ sending: true, done: false, error: '', fields: {} })
    try {
      await api('/reviews', { method: 'POST', body: form })
      setState({ sending: false, done: true, error: '', fields: {} })
      setForm({ customerName: '', rating: 5, comment: '' })
    } catch (error) {
      setState({ sending: false, done: false, error: error.message, fields: error.fields })
    }
  }

  if (state.done) {
    return (
      <div className="rounded-4xl border border-sand bg-paper p-8 text-center">
        <p className="font-display text-xl font-bold">¡Gracias por tu reseña!</p>
        <p className="mt-2 text-sm text-muted">La publicaremos después de revisarla.</p>
        <Button variant="secondary" size="sm" className="mt-5" onClick={() => setState((s) => ({ ...s, done: false }))}>Escribir otra</Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-4xl border border-sand bg-paper p-6 sm:p-8" noValidate>
      <p className="font-display text-xl font-bold">Cuéntanos cómo te fue</p>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Tu calificación</legend>
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} estrellas`} onClick={() => setForm((f) => ({ ...f, rating: n }))} className="rounded-md p-1 transition-transform hover:scale-110">
              <Star size={26} className={n <= form.rating ? 'fill-gold text-gold' : 'fill-sand text-sand'} />
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Nombre" error={state.fields.customerName}>
        <Input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} autoComplete="given-name" maxLength={60} />
      </Field>
      <Field label="Comentario" error={state.fields.comment}>
        <Textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} maxLength={800} />
      </Field>
      {state.error && !Object.keys(state.fields).length && <p className="text-sm text-danger" role="alert">{state.error}</p>}
      <Button type="submit" loading={state.sending} className="w-full">Enviar reseña</Button>
    </form>
  )
}

export function Reviews() {
  const [reviews, setReviews] = useState(null)
  const [writing, setWriting] = useState(false)
  useEffect(() => {
    api('/reviews').then(setReviews).catch(() => setReviews([]))
  }, [])

  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <section id="resenas" className="bg-paper py-14 sm:py-20 lg:py-28">
      <div className="container-x grid gap-8 sm:gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Reseñas" title="Lo que dicen nuestros clientes" />
            {reviews?.length > 0 && (
              <div className="text-right">
                <p className="font-display text-5xl font-black tabular">{avg.toFixed(1)}</p>
                <Stars value={Math.round(avg)} />
                <p className="mt-1 text-xs text-muted">{reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}</p>
              </div>
            )}
          </div>
          <div className="mt-8 sm:mt-10">
            {reviews === null ? (
              <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-40" />)}</div>
            ) : reviews.length === 0 ? (
              <EmptyState icon={MessageSquareQuote} title="Aún no hay reseñas publicadas" message="Sé el primero en contar tu experiencia." className="rounded-3xl border border-dashed border-sand-300 py-10 sm:rounded-4xl sm:py-14" />
            ) : (
              // En celular las reseñas se deslizan de lado; en escritorio van en dos columnas.
              <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:block sm:columns-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>li]:mb-4">
                {reviews.map((r) => (
                  <li key={r.id} className="w-[85%] flex-none snap-start break-inside-avoid rounded-3xl border border-sand bg-white p-6 sm:w-auto">
                    <Stars value={r.rating} />
                    <p className="mt-4 leading-relaxed">“{r.comment}”</p>
                    <p className="mt-5 flex items-center gap-3 text-sm">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-navy font-display font-bold text-paper">{r.customerName.charAt(0).toUpperCase()}</span>
                      <span>
                        <span className="block font-medium">{r.customerName}</span>
                        <span className="block text-xs text-muted">{new Date(r.createdAt).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</span>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="lg:col-span-5">
          {/* En celular el formulario se abre con un botón para no alargar la página. */}
          <Button variant="secondary" className={`w-full lg:hidden ${writing ? 'hidden' : ''}`} onClick={() => setWriting(true)}>
            <Star size={16} aria-hidden="true" /> Escribir una reseña
          </Button>
          <div className={`${writing ? 'block' : 'hidden'} lg:block`}>
            <ReviewForm />
          </div>
        </div>
      </div>
    </section>
  )
}
