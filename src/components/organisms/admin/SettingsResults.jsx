import { SplitSquareHorizontal, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Card } from '../../templates/AdminLayout'
import { ImagePicker } from './ImagePicker'

const MAX = 8

// Casos de antes y después del carrusel. Las fotos deben tener el mismo encuadre para que el
// comparador calce; "Imagen referencial" se marca cuando no es un cliente real.
export function SettingsResults({ value, onChange, errors, upload }) {
  const update = (i, patch) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const move = (i, dir) => {
    const next = [...value]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    onChange(next)
  }
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><SplitSquareHorizontal size={18} aria-hidden="true" /> Antes y después</h2>
        <p className="mt-1 text-sm text-muted">Usa fotos del mismo encuadre (horizontales o cuadradas). Pide permiso al cliente antes de publicar su foto.</p>
      </div>
      <ol className="space-y-3">
        {value.map((item, i) => {
          const err = (key) => errors[`${i}.${key}`]
          return (
            <li key={i} className="space-y-3 rounded-2xl border border-sand bg-white p-3">
              <div className="flex gap-3">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <div>
                    <ImagePicker value={item.before} onChange={(before) => update(i, { before })} upload={upload} label="Foto antes" ratio="aspect-[4/3]" className={`w-full ${err('before') ? 'border-danger' : ''}`} />
                    <p className="mt-1 text-center text-2xs uppercase tracking-[0.12em] text-muted">Antes</p>
                  </div>
                  <div>
                    <ImagePicker value={item.after} onChange={(after) => update(i, { after })} upload={upload} label="Foto después" ratio="aspect-[4/3]" className={`w-full ${err('after') ? 'border-danger' : ''}`} />
                    <p className="mt-1 text-center text-2xs uppercase tracking-[0.12em] text-muted">Después</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir caso ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronUp size={16} /></button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar caso ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-25"><ChevronDown size={16} /></button>
                  <button type="button" disabled={value.length === 1} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar caso ${i + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-25"><Trash2 size={15} /></button>
                </div>
              </div>
              {(err('before') || err('after')) && <p className="text-xs text-danger">Sube la foto de antes y la de después.</p>}
              <Input value={item.caption} maxLength={90} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Ej: Pelo grueso · resultado a las 3 semanas" aria-label={`Descripción del caso ${i + 1}`} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={item.reference} onChange={(e) => update(i, { reference: e.target.checked })} className="h-4 w-4 accent-[#171210]" />
                Imagen referencial (no es un cliente real)
              </label>
            </li>
          )
        })}
      </ol>
      {errors._ && <p className="text-sm text-danger">{errors._}</p>}
      {value.length < MAX && (
        <Button size="sm" variant="secondary" onClick={() => onChange([...value, { before: '', after: '', caption: '', reference: false }])}><Plus size={14} aria-hidden="true" /> Agregar caso</Button>
      )}
    </Card>
  )
}
