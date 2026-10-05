import { Plus, Trash2, ChevronUp, ChevronDown, Megaphone } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Card } from '../../templates/AdminLayout'

const MAX = 6
const LIMIT = 70

// Mensajes que rotan en la barra negra superior de la tienda.
export function SettingsAnnouncements({ value, onChange, errors }) {
  const update = (i, text) => onChange(value.map((m, j) => (j === i ? text : m)))
  const move = (i, dir) => {
    const next = [...value]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    onChange(next)
  }
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Megaphone size={18} aria-hidden="true" /> Barra de anuncios</h2>
        <p className="mt-1 text-sm text-muted">Rotan cada 4 segundos arriba de la tienda. Si cambias el envío gratis, actualiza también ese mensaje.</p>
      </div>
      <ol className="space-y-2">
        {value.map((message, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Input
                value={message}
                maxLength={LIMIT}
                onChange={(e) => update(i, e.target.value)}
                aria-label={`Mensaje ${i + 1}`}
                invalid={Boolean(errors[i])}
              />
              <p className={`mt-1 flex justify-between text-xs ${errors[i] ? 'text-danger' : 'text-muted'}`}>
                <span>{errors[i] || ''}</span>
                <span className="tabular">{message.length}/{LIMIT}</span>
              </p>
            </div>
            <div className="flex flex-col">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir mensaje ${i + 1}`} className="grid h-6 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronUp size={16} /></button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar mensaje ${i + 1}`} className="grid h-6 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronDown size={16} /></button>
            </div>
            <button type="button" disabled={value.length === 1} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar mensaje ${i + 1}`} className="grid h-12 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-25"><Trash2 size={16} /></button>
          </li>
        ))}
      </ol>
      {errors._ && <p className="text-sm text-danger">{errors._}</p>}
      {value.length < MAX && (
        <Button size="sm" variant="secondary" onClick={() => onChange([...value, ''])}><Plus size={14} aria-hidden="true" /> Agregar mensaje</Button>
      )}
    </Card>
  )
}
