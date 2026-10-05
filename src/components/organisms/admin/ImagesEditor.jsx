import { useRef, useState } from 'react'
import { ImagePlus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { compressImage } from '../../../lib/image'
import { toast } from '../../../store/toast'

// Galería del producto: subir (se comprime en el navegador), ordenar y quitar.
export function ImagesEditor({ images, onChange, mutate }) {
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
