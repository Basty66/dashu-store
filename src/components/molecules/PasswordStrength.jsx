// Medidor simple de fortaleza: largo, mezcla de letras/números/símbolos. Solo orienta;
// la regla real (mín. 10, letras y números) la valida el servidor.
function score(password) {
  if (!password) return 0
  let s = 0
  if (password.length >= 10) s++
  if (password.length >= 14) s++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) s++
  if (/[^a-zA-Z0-9]/.test(password)) s++
  return Math.min(4, s)
}

const LEVELS = [
  { label: 'Muy corta', bar: 'bg-danger' },
  { label: 'Débil', bar: 'bg-danger' },
  { label: 'Aceptable', bar: 'bg-warning' },
  { label: 'Buena', bar: 'bg-success' },
  { label: 'Excelente', bar: 'bg-success' },
]

export function PasswordStrength({ password }) {
  const value = score(password)
  const level = LEVELS[value]
  if (!password) return null
  return (
    <div className="mt-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 rounded-full transition-colors duration-300 ${i <= value ? level.bar : 'bg-sand'}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">Seguridad: <span className="font-medium text-ink">{level.label}</span></p>
    </div>
  )
}
