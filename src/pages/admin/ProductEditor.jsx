import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, EyeOff } from 'lucide-react'
import { PACK_SIZES } from '@shared/store.js'
import { useAdminData } from '../../hooks/useAdminData'
import { toast } from '../../store/toast'
import { Button } from '../../components/atoms/Button'
import { Input, Textarea } from '../../components/atoms/Input'
import { Skeleton } from '../../components/atoms/Misc'
import { Field } from '../../components/molecules/Field'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage, Card } from '../../components/templates/AdminLayout'
import { PacksEditor } from '../../components/organisms/admin/PacksEditor'
import { ImagesEditor } from '../../components/organisms/admin/ImagesEditor'
import { errorsFor } from '../../lib/formErrors'

const blank = {
  title: '', slug: '', brand: 'DASHU', subtitle: '', description: '', howToUse: '', ingredients: '', contentSize: '',
  category: 'alisado', images: [], isActive: true, sortOrder: 0, stock: 0,
  packs: PACK_SIZES.map((units) => ({ units, price: 0, isActive: true, salePrice: null, saleStartsAt: null, saleEndsAt: null })),
}

// Formato listo para la API: sin oferta no viajan fechas sueltas.
function packPayload(p) {
  const hasSale = p.salePrice !== null && p.salePrice !== undefined
  return {
    units: Number(p.units),
    price: Number(p.price),
    isActive: p.isActive,
    salePrice: hasSale ? Number(p.salePrice) : null,
    saleStartsAt: hasSale ? p.saleStartsAt : null,
    saleEndsAt: hasSale ? p.saleEndsAt : null,
  }
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
    const body = { ...fields, sortOrder: Number(form.sortOrder) || 0, packs: form.packs.map(packPayload) }
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

  const packErrors = errorsFor(errors, 'packs')
  const packsError = packErrors._ || Object.entries(errors).find(([k]) => /^packs.d+.(units|price)$/.test(k))?.[1]

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
            <PacksEditor packs={form.packs} onChange={(packs) => setForm((f) => ({ ...f, packs }))} error={packsError} rowErrors={packErrors} />
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
            <label className="flex items-center justify-between gap-3 text-sm"><span>Visible en la tienda</span><input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-5 w-5 accent-[#171210]" /></label>
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
