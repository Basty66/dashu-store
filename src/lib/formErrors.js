// Errores de una sección del formulario: { 'shipping.rates.Maule': 'x' } -> { 'rates.Maule': 'x' }.
export function errorsFor(errors, prefix) {
  const out = {}
  for (const [key, message] of Object.entries(errors || {})) {
    if (key === prefix) out._ = message
    else if (key.startsWith(`${prefix}.`)) out[key.slice(prefix.length + 1)] = message
  }
  return out
}
