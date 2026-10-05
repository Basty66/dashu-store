import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatCLP, packUnitPrice, packSavings, couponDiscount, nextPackUpsell, referenceUnitPrice } from '../shared/pricing.js'
import { isValidRut, formatRut, cleanRut } from '../shared/rut.js'
import { resolveTrackingUrl } from '../shared/shipping.js'
import { DEFAULT_STORE_CONFIG, shippingCostFor } from '../shared/storeConfig.js'
import { REGIONS, communesOf, isValidCommune } from '../shared/chile.js'
import { checkoutSchema, fieldErrors } from '../shared/checkoutSchema.js'
import { ADMIN_TRANSITIONS, ORDER_STATUS } from '../shared/orderStatus.js'

const packs = [
  { units: 1, price: 14000 },
  { units: 5, price: 62500 },
  { units: 10, price: 115000 },
]

test('formatCLP usa formato chileno sin decimales', () => {
  assert.equal(formatCLP(14000).replace(/\s/g, ''), '$14.000')
  assert.equal(formatCLP(0).replace(/\s/g, ''), '$0')
})

test('precio por unidad y ahorro de packs', () => {
  assert.equal(packUnitPrice(packs[1]), 12500)
  assert.equal(referenceUnitPrice(packs), 14000)
  assert.deepEqual(packSavings(packs[2], packs), { amount: 25000, percent: 18 })
  assert.deepEqual(packSavings(packs[0], packs), { amount: 0, percent: 0 })
})

test('upsell sugiere el siguiente pack si es más barato por unidad', () => {
  const upsell = nextPackUpsell(5, packs)
  assert.equal(upsell.pack.units, 10)
  assert.equal(upsell.savingPerUnit, 1000)
  assert.equal(nextPackUpsell(10, packs), null)
})

test('cupones nunca descuentan más que el subtotal', () => {
  assert.equal(couponDiscount({ type: 'percentage', value: 10 }, 115000), 11500)
  assert.equal(couponDiscount({ type: 'fixed', value: 5000 }, 3000), 3000)
  assert.equal(couponDiscount(null, 1000), 0)
})

test('RUT chileno', () => {
  assert.equal(isValidRut('11.111.111-1'), true)
  assert.equal(isValidRut('76.086.428-5'), true)
  assert.equal(isValidRut('12.345.678-5'), true)
  assert.equal(isValidRut('12.345.678-9'), false)
  assert.equal(isValidRut('abc'), false)
  assert.equal(formatRut('123456785'), '12.345.678-5')
  assert.equal(cleanRut('7.654.321-k'), '7654321K')
})

test('regiones y comunas completas', () => {
  assert.equal(REGIONS.length, 16)
  assert.equal(REGIONS.reduce((n, r) => n + r.communes.length, 0), 346)
  for (const region of REGIONS) assert.ok(region.name in DEFAULT_STORE_CONFIG.shipping.rates, `falta tarifa: ${region.name}`)
  assert.ok(communesOf('Metropolitana de Santiago').includes('Melipilla'))
  assert.equal(isValidCommune('Valparaíso', 'Maipú'), false)
})

test('costo de envío por región y envío gratis', () => {
  const shipping = DEFAULT_STORE_CONFIG.shipping
  assert.equal(shippingCostFor(shipping, 'Magallanes y de la Antártica Chilena', 10000), 10000)
  assert.equal(shippingCostFor(shipping, 'Región inventada', 10000), null)
  assert.equal(shippingCostFor(shipping, 'Maule', shipping.freeFrom), 0)
  assert.equal(shippingCostFor({ ...shipping, freeFrom: null }, 'Maule', 9_999_999), shipping.rates.Maule)
})

test('link de seguimiento por courier', () => {
  assert.equal(resolveTrackingUrl('starken', '123', null), 'https://www.starken.cl/seguimiento?codigo=123')
  assert.equal(resolveTrackingUrl('otro', '123', null), null)
  assert.equal(resolveTrackingUrl('starken', '123', 'https://x.cl/t'), 'https://x.cl/t')
})

test('las transiciones del admin apuntan a estados existentes', () => {
  for (const [from, targets] of Object.entries(ADMIN_TRANSITIONS)) {
    assert.ok(ORDER_STATUS[from])
    for (const to of targets) assert.ok(ORDER_STATUS[to], `${from} -> ${to}`)
  }
})

const validCheckout = {
  items: [{ productId: 1, packUnits: 5, quantity: 2 }],
  customer: {
    name: 'Juan Pérez',
    email: 'Juan@Correo.cl ',
    phone: '+56 9 1234 5678',
    region: 'Metropolitana de Santiago',
    commune: 'Providencia',
    address: 'Av. Providencia 1234, depto 5',
    documentType: 'boleta',
  },
}

test('checkout válido normaliza el email', () => {
  const data = checkoutSchema.parse(validCheckout)
  assert.equal(data.customer.email, 'juan@correo.cl')
})

test('checkout con factura exige RUT, razón social y giro', () => {
  const result = checkoutSchema.safeParse({
    ...validCheckout,
    customer: { ...validCheckout.customer, documentType: 'factura' },
  })
  assert.equal(result.success, false)
  const errors = fieldErrors(result.error)
  assert.ok(errors['customer.rut'])
  assert.ok(errors['customer.businessName'])
  assert.ok(errors['customer.businessActivity'])
})

test('checkout rechaza comuna de otra región y carrito vacío', () => {
  const bad = checkoutSchema.safeParse({ ...validCheckout, items: [], customer: { ...validCheckout.customer, commune: 'Temuco' } })
  assert.equal(bad.success, false)
  const errors = fieldErrors(bad.error)
  assert.ok(errors.items)
  assert.ok(errors['customer.commune'])
})
