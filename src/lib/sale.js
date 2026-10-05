import { discountPercent } from '@shared/pricing.js'

const endDate = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', timeZone: 'America/Santiago' })

// "Termina en 5 h", "Quedan 3 días" o "Hasta el 12 de octubre". null si ya terminó o no tiene fecha.
export function saleEndsLabel(endsAt, now = new Date()) {
  if (!endsAt) return null
  const ms = new Date(endsAt).getTime() - now.getTime()
  if (ms <= 0) return null
  const hours = ms / 3_600_000
  if (hours < 24) return `Termina en ${Math.max(1, Math.ceil(hours))} h`
  const days = Math.floor(hours / 24)
  if (days <= 7) return days === 1 ? 'Queda 1 día' : `Quedan ${days} días`
  return `Hasta el ${endDate.format(new Date(endsAt))}`
}

export function packDiscount(pack) {
  return pack.regularPrice > pack.price ? discountPercent(pack.regularPrice, pack.price) : 0
}

// Mayor descuento vigente entre los formatos de un producto (0 = sin oferta).
export function productDiscount(product) {
  return Math.max(0, ...product.packs.map(packDiscount))
}
