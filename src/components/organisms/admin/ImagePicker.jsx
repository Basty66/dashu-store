import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw } from 'lucide-react'
import { compressImage } from '../../../lib/image'
import { toast } from '../../../store/toast'

// Botón para subir una imagen (se comprime en el navegador) con vista previa.
// Con imagen cargada, tocarlo permite reemplazarla. `upload(dataUrl)` -> { url }.
export function ImagePicker({ value, onChange, upload, label, ratio = 'aspect-square', maxSize = 1600, className = '' }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  async function pick(file) {
    if (!file) return
    setBusy(true)
    try {
      const { url } = await upload(await compressImage(file, { maxSize }))
      onChange(url)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={value ? `Cambiar ${label}` : `Subir ${label}`}
        className={`group relative grid place-items-center overflow-hidden rounded-xl border-2 border-dashed border-sand-300 bg-bone text-muted transition-colors duration-200 hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${ratio} ${className}`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-ink/55 text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              <RefreshCw size={16} aria-hidden="true" />
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1 px-2 text-center text-xs"><ImagePlus size={18} aria-hidden="true" />{label}</span>
        )}
        {busy && <span className="absolute inset-0 animate-pulse bg-sand" aria-hidden="true" />}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { void pick(e.target.files[0]); e.target.value = '' }} />
    </>
  )
}
