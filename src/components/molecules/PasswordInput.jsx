import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../atoms/Input'

// Campo de contraseña con botón para mostrarla y aviso de Bloq Mayús activado.
export function PasswordInput({ className = '', onKeyUp, ...props }) {
  const [visible, setVisible] = useState(false)
  const [caps, setCaps] = useState(false)
  return (
    <div>
      <div className="relative">
        <Input
          type={visible ? 'text' : 'password'}
          spellCheck={false}
          autoCapitalize="none"
          className={`pr-12 ${className}`}
          onKeyUp={(e) => {
            setCaps(e.getModifierState?.('CapsLock') ?? false)
            onKeyUp?.(e)
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {caps && <p className="mt-1.5 text-xs font-medium text-warning" role="status">Bloq Mayús está activado</p>}
    </div>
  )
}
