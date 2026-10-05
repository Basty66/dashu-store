import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSaleActive, effectivePrice, discountPercent } from '../shared/pricing.js'
import { DEFAULT_STORE_CONFIG, readStoreConfig, storeConfigSchema, parseInstagramUrl, instagramEmbedUrl, instagramHandle } from '../shared/storeConfig.js'

const now = new Date('2026-10-05T12:00:00Z')
const day = 86_400_000

test('oferta: vigente solo dentro de sus fechas y si es menor al precio normal', () => {
  const pack = { price: 30000, salePrice: 25000, saleStartsAt: null, saleEndsAt: null }
  assert.equal(isSaleActive(pack, now), true)
  assert.equal(effectivePrice(pack, now), 25000)
  assert.equal(isSaleActive({ ...pack, saleStartsAt: new Date(now.getTime() + day) }, now), false)
  assert.equal(isSaleActive({ ...pack, saleEndsAt: new Date(now.getTime() - 1) }, now), false)
  assert.equal(isSaleActive({ ...pack, saleEndsAt: new Date(now.getTime() + day) }, now), true)
  assert.equal(isSaleActive({ ...pack, salePrice: 30000 }, now), false)
  assert.equal(effectivePrice({ ...pack, salePrice: null }, now), 30000)
  assert.equal(discountPercent(30000, 25000), 17)
})

test('ajustes: completa con valores por defecto y conserva lo válido', () => {
  assert.deepEqual(readStoreConfig(null), DEFAULT_STORE_CONFIG)
  assert.deepEqual(readStoreConfig('no es json'), DEFAULT_STORE_CONFIG)
  const saved = readStoreConfig(JSON.stringify({ distributor: { unitCost: 18000 }, shipping: { freeFrom: null, rates: { Maule: 4500 } } }))
  assert.equal(saved.distributor.unitCost, 18000)
  assert.equal(saved.distributor.minBoxes, 3)
  assert.equal(saved.shipping.freeFrom, null)
  assert.equal(saved.shipping.rates.Maule, 4500)
  assert.equal(saved.shipping.rates['Biobío'], 4000)
  // Una sección inválida vuelve a su valor por defecto sin borrar las demás.
  const mixed = readStoreConfig({ distributor: { unitCost: -1 }, highlightPackUnits: 10 })
  assert.equal(mixed.distributor.unitCost, 19000)
  assert.equal(mixed.highlightPackUnits, 10)
})

test('ajustes: valida WhatsApp, links y reels', () => {
  const ok = storeConfigSchema.parse({ ...DEFAULT_STORE_CONFIG, contact: { ...DEFAULT_STORE_CONFIG.contact, whatsapp: '+56 9 1234 5678' } })
  assert.equal(ok.contact.whatsapp, '56912345678')
  assert.equal(storeConfigSchema.safeParse({ ...DEFAULT_STORE_CONFIG, contact: { ...DEFAULT_STORE_CONFIG.contact, whatsapp: 'abc' } }).success, false)
  assert.equal(storeConfigSchema.safeParse({ ...DEFAULT_STORE_CONFIG, social: { ...DEFAULT_STORE_CONFIG.social, tiktok: 'tiktok.com/@x' } }).success, false)
  assert.equal(storeConfigSchema.safeParse({ ...DEFAULT_STORE_CONFIG, reels: [{ url: 'https://youtube.com/x' }] }).success, false)
  assert.equal(storeConfigSchema.safeParse({ ...DEFAULT_STORE_CONFIG, reels: [{ url: 'https://www.instagram.com/reel/DAbc12345/' }] }).success, true)
})

test('instagram: reconoce reels y publicaciones, arma el reproductor y el @usuario', () => {
  assert.deepEqual(parseInstagramUrl('https://www.instagram.com/reel/DAbc12345/?igsh=xyz'), { type: 'reel', code: 'DAbc12345' })
  assert.deepEqual(parseInstagramUrl('https://instagram.com/dashu.cl/p/Cxyz98765/'), { type: 'p', code: 'Cxyz98765' })
  assert.equal(parseInstagramUrl('https://evil.com/reel/DAbc12345/'), null)
  assert.equal(instagramEmbedUrl('https://www.instagram.com/reels/DAbc12345/'), 'https://www.instagram.com/reel/DAbc12345/embed/')
  assert.equal(instagramHandle('https://www.instagram.com/dashu.cl/'), '@dashu.cl')
})
