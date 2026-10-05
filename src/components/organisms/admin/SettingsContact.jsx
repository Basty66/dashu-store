import { AtSign } from 'lucide-react'
import { Input } from '../../atoms/Input'
import { Field } from '../../molecules/Field'
import { Card } from '../../templates/AdminLayout'

const NETWORKS = [
  ['instagram', 'Instagram', 'https://www.instagram.com/dashu.cl/'],
  ['tiktok', 'TikTok', 'https://www.tiktok.com/@usuario'],
  ['facebook', 'Facebook', 'https://www.facebook.com/pagina'],
  ['youtube', 'YouTube', 'https://www.youtube.com/@canal'],
]

// Contacto (WhatsApp, email, horario) y links a redes sociales.
export function SettingsContact({ contact, social, onContact, onSocial, errors }) {
  const setContact = (key) => (e) => onContact({ ...contact, [key]: e.target.value })
  const setSocial = (key) => (e) => onSocial({ ...social, [key]: e.target.value })
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><AtSign size={18} aria-hidden="true" /> Contacto y redes</h2>
        <p className="mt-1 text-sm text-muted">Se muestran en el pie de página, el menú, el botón de WhatsApp y la página de contacto.</p>
      </div>
      <Field label="WhatsApp" optional error={errors['contact.whatsapp']} hint="Con código de país, ej: 56912345678. Vacío oculta el botón.">
        <Input value={contact.whatsapp} onChange={setContact('whatsapp')} inputMode="tel" placeholder="56912345678" className="font-mono" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email de contacto" error={errors['contact.email']}>
          <Input type="email" value={contact.email} onChange={setContact('email')} />
        </Field>
        <Field label="Horario de atención" optional error={errors['contact.hours']}>
          <Input value={contact.hours} onChange={setContact('hours')} placeholder="Lunes a viernes, 10:00 a 18:00" />
        </Field>
      </div>
      <div className="grid gap-5 border-t border-sand pt-5 sm:grid-cols-2">
        {NETWORKS.map(([key, label, placeholder]) => (
          <Field key={key} label={label} optional error={errors[`social.${key}`]}>
            <Input type="url" value={social[key]} onChange={setSocial(key)} placeholder={placeholder} />
          </Field>
        ))}
      </div>
    </Card>
  )
}
