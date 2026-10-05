import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { storeConfigSchema } from '@shared/storeConfig.js'
import { fieldErrors } from '@shared/checkoutSchema.js'
import { useAdminData } from '../../hooks/useAdminData'
import { errorsFor } from '../../lib/formErrors'
import { toast } from '../../store/toast'
import { useStoreConfig } from '../../store/storeConfig'
import { Button } from '../../components/atoms/Button'
import { Skeleton } from '../../components/atoms/Misc'
import { ErrorState } from '../../components/molecules/Feedback'
import { AdminPage } from '../../components/templates/AdminLayout'
import { SettingsAnnouncements } from '../../components/organisms/admin/SettingsAnnouncements'
import { SettingsContact } from '../../components/organisms/admin/SettingsContact'
import { SettingsReels } from '../../components/organisms/admin/SettingsReels'
import { SettingsResults } from '../../components/organisms/admin/SettingsResults'
import { SettingsDistributor, SettingsHighlight } from '../../components/organisms/admin/SettingsCommerce'
import { SettingsShipping } from '../../components/organisms/admin/SettingsShipping'

// Admin → Ajustes: lo que antes estaba fijo en el código y ahora Tomás cambia solo.
export default function Settings() {
  const { data, error, loading, reload, mutate } = useAdminData('/admin/settings')
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const dirty = Boolean(form && data) && JSON.stringify(form) !== JSON.stringify(data)
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const upload = (dataUrl) => mutate('/admin/images', { method: 'POST', body: { dataUrl } })

  async function save(e) {
    e.preventDefault()
    const parsed = storeConfigSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      toast('Revisa los campos marcados', 'error')
      return
    }
    setSaving(true)
    setErrors({})
    try {
      const saved = await mutate('/admin/settings', { method: 'PUT', body: parsed.data })
      setForm(saved)
      useStoreConfig.getState().replace(saved)
      await reload()
      toast('Ajustes guardados. La tienda se actualiza en menos de un minuto.')
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (error) return <AdminPage title="Ajustes"><ErrorState message={error.message} onRetry={reload} /></AdminPage>
  if (!form || (loading && !data)) {
    return (
      <AdminPage title="Ajustes">
        <div className="grid gap-6 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-3xl" />)}</div>
      </AdminPage>
    )
  }

  return (
    <AdminPage title="Ajustes" description="Envíos, distribuidores, anuncios, contacto, redes, antes y después y videos de la tienda.">
      <form id="ajustes" onSubmit={save} noValidate className="grid gap-6 pb-24 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <SettingsAnnouncements value={form.announcements} onChange={set('announcements')} errors={errorsFor(errors, 'announcements')} />
          <SettingsDistributor value={form.distributor} onChange={set('distributor')} errors={errorsFor(errors, 'distributor')} />
          <SettingsHighlight value={form.highlightPackUnits} onChange={set('highlightPackUnits')} />
        </div>
        <div className="space-y-6">
          <SettingsContact contact={form.contact} social={form.social} onContact={set('contact')} onSocial={set('social')} errors={errors} />
          <SettingsResults value={form.results} onChange={set('results')} errors={errorsFor(errors, 'results')} upload={upload} />
          <SettingsReels value={form.reels} onChange={set('reels')} errors={errorsFor(errors, 'reels')} upload={upload} />
        </div>
        <div className="lg:col-span-2">
          <SettingsShipping value={form.shipping} onChange={set('shipping')} errors={errorsFor(errors, 'shipping')} />
        </div>
      </form>

      {/* Barra fija para guardar: aparece cuando hay cambios. */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-paper/95 px-4 pt-3 backdrop-blur lg:left-[248px]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <p className="text-sm text-muted">Tienes cambios sin guardar</p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setForm(data); setErrors({}) }}>Descartar</Button>
                <Button type="submit" form="ajustes" loading={saving}><Save size={16} aria-hidden="true" /> Guardar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  )
}
