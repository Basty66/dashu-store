import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Trash2, Plus, ChevronLeft, ChevronRight, Save, EyeOff } from 'lucide-react'
import { PACK_SIZES } from '@shared/store.js'
import { formatCLP } from '@shared/pricing.js'
import { useAdminData } from '../../hooks/useAdminData'
import { compressImage } from '../../lib/image'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Input, Textarea } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'

const blank = {
  title: '', slug: '', brand: 'DASHU', subtitle: '', description: '', howToUse: '', ingredients: '', contentSize: '',
  category: 'alisado', images: [], isActive: true, sortOrder: 0, stock: 0,
  packs: PACK_SIZES.map((units) => ({ units, price: 0, isActive: true })),
}

function PacksEditor({ packs, onChange, errors }) {
  const update = (i, patch) => onChange(packs.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const missing = PACK_SIZES.filter((u) => !packs.some((p) => p.units === u))
  const unitRef = packs.find((p) => p.units === 1)?.price || 0
  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-12 gap-3 px-1 font-mono text-2xs uppercase tracking-[0.12em] text-muted sm:grid">
        <span className="col-span-2">Unidades</span><span className="col-span-4">Precio del pack (CLP)</span><span className="col-span-3">Por unidad</span><span className="col-span-3 text-right">Visible</span>
      </div>
      {packs.map((p, i) => {
        const per = p.units > 0 && p.price > 0 ? Math.round(p.price / p.units) : 0
        const saving = unitRef && per && p.units > 1 ? Math.round((1 - per / unitRef) * 100) : 0
        return (
          <div key={i} className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-sand bg-white p-3">
            <Input type="number" min={1} value={p.units} onChange={(e) => update(i, { units: Number(e.target.value) })} className="col-span-3 h-11 font-mono sm:col-span-2" aria-label="Unidades del pack" />
            <Input type="number" min={0} step={500} value={p.price || ''} onChange={(e) => update(i, { price: Number(e.target.value) })} className="col-span-9 h-11 font-mono sm:col-span-4" aria-label={`Precio del pack de ${p.units}`} placeholder="Ej: 115000" />
            <p className="col-span-7 text-sm tabular sm:col-span-3">{per ? formatCLP(per) : '—'}{saving > 0 && <span className="ml-2 text-xs text-success">−{saving}%</span>}</p>
            <div className="col-span-5 flex items-center justify-end gap-2 sm:col-span-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} className="h-4 w-4 accent-[#0B1220]" /> Sí</label>
              <button type="button" onClick={() => onChange(packs.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Quitar pack de ${p.units}`}><Trash2 size={15} /></button>
            </div>
          </div>
        )
      })}
      {errors && <p className="text-sm text-danger">{errors}</p>}
      <div className="flex flex-wrap gap-2">
        {missing.map((u) => (
          <Button key={u} size="sm" variant="secondary" onClick={() => onChange([...packs, { units: u, price: 0, isActive: true }].sort((a, b) => a.units - b.units))}><Plus size={14} /> {u === 1 ? 'Unidad' : `Pack ${u}`}</Button>
        ))}
      </div>
    </div>
  )
}

function ImagesEditor({ images, onChange, mutate }) {
  const input = useRef(null)
  const [uploading, setUploading] = useState(false)
  const move = (i, d) => {
    const next = [...images]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  async function upload(files) {
    setUploading(true)
    const urls = []
    try {
      for (const file of files) {
        try {
          const dataUrl = await compressImage(file)
          const { url } = await mutate('/admin/images', { method: 'POST', body: { dataUrl } })
          urls.push(url)
        } catch (e) {
          toast(`${file.name}: ${e.message}`, 'error')
        }
      }
      onChange([...images, ...urls])
    } finally {
      setUploading(false)
    }
  }
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((src, i) => (
          <div key={src} className="group relative aspect-square overflow-hidden rounded-2xl bg-navy">
            <img src={src} alt={`Imagen ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-paper px-2 py-0.5 text-2xs font-medium">Principal</span>}
            <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full bg-paper p-1.5 disabled:opacity-30" aria-label="Mover a la izquierda"><ChevronLeft size={14} /></button>
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="rounded-full bg-paper p-1.5 text-danger" aria-label="Quitar imagen"><Trash2 size={14} /></button>
              <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="rounded-full bg-paper p-1.5 disabled:opacity-30" aria-label="Mover a la derecha"><ChevronRight size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-sand-300 text-muted transition-colors hover:border-ink hover:text-ink">
          <span className="flex flex-col items-center gap-1 text-xs"><ImagePlus size={20} />{uploading ? 'Subiendo…' : 'Agregar'}</span>
        </button>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { void upload([...e.target.files]); e.target.value = '' }} />
      <p className="mt-2 text-xs text-muted">Las imágenes se comprimen automáticamente. La primera es la principal. Usa fotos cuadradas para mejor resultado.</p>
    </div>
  )
}

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { data: list, error, loading, reload, mutate } = useAdminData(isNew ? null : '/admin/products')
  const [form, setForm] = useState(isNew ? blank : null)
  const [stockDelta, setStockDelta] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew || !list) return
    const p = list.find((x) => String(x.id) === id)
    if (p) setForm({ ...p })
  }, [list, id, isNew])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const { id: _id, stock, ...fields } = form
    const body = { ...fields, sortOrder: Number(form.sortOrder) || 0, packs: form.packs.map((p) => ({ units: Number(p.units), price: Number(p.price), isActive: p.isActive })) }
    if (isNew) body.stock = Number(stock) || 0
    else body.stockDelta = Number(stockDelta) || 0
    try {
      const saved = await mutate(isNew ? '/admin/products' : `/admin/products/${id}`, { method: isNew ? 'POST' : 'PATCH', body })
      toast('Producto guardado')
      setStockDelta('')
      if (isNew) navigate(`/admin/productos/${saved.id}`, { replace: true })
      else setForm({ ...saved })
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!window.confirm('¿Eliminar este producto? Si tiene ventas, solo se ocultará de la tienda.')) return
    const r = await mutate(`/admin/products/${id}`, { method: 'DELETE' })
    toast(r.archived ? 'El producto tenía ventas: quedó oculto' : 'Producto eliminado')
    navigate('/admin/productos')
  }

  if (!isNew && error) return <AdminPage title="Producto"><ErrorState message={error.message} onRetry={reload} /></AdminPage>
  if (!form || (loading && !isNew && !list)) return <AdminPage title="Producto"><Skeleton className="h-96 rounded-3xl" /></AdminPage>

  const packsError = Object.entries(errors).find(([k]) => k.startsWith('packs'))?.[1]

  return (
    <AdminPage title={isNew ? 'Nuevo producto' : form.title} actions={<Button variant="ghost" size="sm" to="/admin/productos"><ArrowLeft size={15} /> Productos</Button>}>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5">
            <Field label="Nombre" error={errors.title}><Input value={form.title} onChange={set('title')} /></Field>
            <Field label="Bajada" optional hint="Frase corta bajo el nombre"><Input value={form.subtitle} onChange={set('subtitle')} /></Field>
            <Field label="Descripción" error={errors.description}><Textarea value={form.description} onChange={set('description')} rows={5} /></Field>
            <Field label="Modo de uso" optional><Textarea value={form.howToUse} onChange={set('howToUse')} rows={4} /></Field>
            <Field label="Ingredientes destacados" optional hint="Separados por coma"><Input value={form.ingredients} onChange={set('ingredients')} /></Field>
          </Card>
          <Card>
            <h2 className="mb-4 font-display text-lg font-bold">Formatos de venta</h2>
            <PacksEditor packs={form.packs} onChange={(packs) => setForm((f) => ({ ...f, packs }))} errors={packsError} />
          </Card>
          <Card>
            <h2 className="mb-4 font-display text-lg font-bold">Imágenes</h2>
            <ImagesEditor images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} mutate={mutate} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-bold">Stock</h2>
            {isNew ? (
              <Field label="Unidades iniciales"><Input type="number" min={0} value={form.stock} onChange={set('stock')} /></Field>
            ) : (
              <>
                <p className="font-display text-4xl font-bold tabular">{form.stock} <span className="text-base font-normal text-muted">unidades</span></p>
                <Field label="Ajustar stock" hint="Ej: 120 si llegó mercadería, -3 si hubo mermas. Se suma al stock actual.">
                  <Input type="number" value={stockDelta} onChange={(e) => setStockDelta(e.target.value)} placeholder="+/- unidades" />
                </Field>
              </>
            )}
          </Card>
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-bold">Publicación</h2>
            <label className="flex items-center justify-between gap-3 text-sm"><span>Visible en la tienda</span><input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-5 w-5 accent-[#0B1220]" /></label>
            <Field label="Marca"><Input value={form.brand} onChange={set('brand')} /></Field>
            <Field label="Contenido" optional hint="Ej: 150 ml"><Input value={form.contentSize} onChange={set('contentSize')} /></Field>
            <Field label="URL" optional error={errors.slug} hint="Se genera desde el nombre si la dejas vacía"><Input value={form.slug} onChange={set('slug')} className="font-mono" /></Field>
            <Field label="Orden" hint="Menor número aparece primero"><Input type="number" value={form.sortOrder} onChange={set('sortOrder')} /></Field>
          </Card>
          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" loading={saving}><Save size={16} /> Guardar cambios</Button>
            {!isNew && <Button variant="ghost" onClick={remove} className="text-danger"><EyeOff size={15} /> Eliminar u ocultar</Button>}
          </div>
        </div>
      </form>
    </AdminPage>
  )
}
