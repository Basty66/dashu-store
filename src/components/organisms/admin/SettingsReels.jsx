import { Clapperboard, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Card } from '../../templates/AdminLayout'
import { ImagePicker } from './ImagePicker'

const MAX = 8

// Reels de Instagram para el carrusel de "Antes y después".
export function SettingsReels({ value, onChange, errors, upload }) {
  const update = (i, patch) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const move = (i, dir) => {
    const next = [...value]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    onChange(next)
  }
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Clapperboard size={18} aria-hidden="true" /> Videos de Instagram</h2>
        <p className="mt-1 text-sm text-muted">En Instagram abre el reel, toca ••• → Copiar enlace y pégalo aquí. La portada es opcional (foto vertical).</p>
      </div>
      {value.length === 0 && <p className="rounded-2xl bg-bone p-4 text-sm text-muted">Sin videos: la tienda muestra solo el botón para seguir la cuenta de Instagram.</p>}
      <ol className="space-y-3">
        {value.map((reel, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-sand bg-white p-3">
            <div className="flex w-16 flex-none flex-col items-center gap-1">
              <ImagePicker value={reel.cover} onChange={(cover) => update(i, { cover })} upload={upload} label="Portada" ratio="aspect-[9/16]" maxSize={900} className="w-16" />
              {reel.cover && <button type="button" onClick={() => update(i, { cover: '' })} className="text-2xs text-muted underline-offset-2 hover:text-danger hover:underline">Quitar</button>}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Input value={reel.url} onChange={(e) => update(i, { url: e.target.value })} placeholder="https://www.instagram.com/reel/…" aria-label={`Link del video ${i + 1}`} invalid={Boolean(errors[`${i}.url`])} />
              {errors[`${i}.url`] && <p className="text-xs text-danger">{errors[`${i}.url`]}</p>}
              <Input value={reel.caption} maxLength={80} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Título corto (opcional)" aria-label={`Título del video ${i + 1}`} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir video ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronUp size={16} /></button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar video ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronDown size={16} /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar video ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger"><Trash2 size={15} /></button>
            </div>
          </li>
        ))}
      </ol>
      {errors._ && <p className="text-sm text-danger">{errors._}</p>}
      {value.length < MAX && (
        <Button size="sm" variant="secondary" onClick={() => onChange([...value, { url: '', caption: '', cover: '' }])}><Plus size={14} aria-hidden="true" /> Agregar video</Button>
      )}
    </Card>
  )
}
