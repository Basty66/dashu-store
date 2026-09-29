// Validación y formato de RUT chileno (módulo 11).

export function cleanRut(value) {
  return String(value || '').replace(/[^0-9kK]/g, '').toUpperCase()
}

export function rutCheckDigit(body) {
  let sum = 0
  let factor = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const dv = 11 - (sum % 11)
  if (dv === 11) return '0'
  if (dv === 10) return 'K'
  return String(dv)
}

export function isValidRut(value) {
  const rut = cleanRut(value)
  if (rut.length < 8 || rut.length > 9) return false
  const body = rut.slice(0, -1)
  if (!/^\d+$/.test(body)) return false
  return rutCheckDigit(body) === rut.slice(-1)
}

export function formatRut(value) {
  const rut = cleanRut(value)
  if (rut.length < 2) return rut
  const body = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${body}-${rut.slice(-1)}`
}
