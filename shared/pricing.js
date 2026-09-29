// Cálculos de precio compartidos por la tienda y el servidor. Montos en CLP enteros.

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCLP(amount) {
  return clpFormatter.format(Math.round(amount || 0))
}

export function packUnitPrice(pack) {
  return Math.round(pack.price / pack.units)
}

export function packLabel(units) {
  return units === 1 ? 'Unidad' : `Pack ${units}`
}

export function packLabelLong(units) {
  return units === 1 ? '1 unidad' : `Pack de ${units} unidades`
}

// Precio unitario de referencia: el de la unidad suelta, o el más caro por unidad.
export function referenceUnitPrice(packs) {
  const single = packs.find((p) => p.units === 1)
  if (single) return single.price
  return Math.max(...packs.map(packUnitPrice))
}

// Ahorro de un pack contra comprar las mismas unidades sueltas.
export function packSavings(pack, packs) {
  const ref = referenceUnitPrice(packs)
  const full = ref * pack.units
  const amount = Math.max(0, full - pack.price)
  const percent = full > 0 ? Math.round((amount / full) * 100) : 0
  return { amount, percent }
}

export function sortPacks(packs) {
  return [...packs].sort((a, b) => a.units - b.units)
}

export function lowestUnitPrice(packs) {
  return Math.min(...packs.map(packUnitPrice))
}

export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  if (coupon.type === 'percentage') return Math.min(subtotal, Math.round(subtotal * (coupon.value / 100)))
  return Math.min(subtotal, coupon.value)
}

// Sugerencia de upsell: si subir al siguiente pack sale más barato por unidad.
export function nextPackUpsell(currentUnits, packs) {
  const sorted = sortPacks(packs.filter((p) => p.isActive !== false))
  const current = sorted.find((p) => p.units === currentUnits)
  const next = sorted.find((p) => p.units > currentUnits)
  if (!current || !next) return null
  const saving = packUnitPrice(current) - packUnitPrice(next)
  if (saving <= 0) return null
  return { pack: next, savingPerUnit: saving }
}
