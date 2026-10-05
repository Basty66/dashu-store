import { getSetting, setSetting } from './settings.js'
import { readStoreConfig, storeConfigSchema } from '../shared/storeConfig.js'

const KEY = 'store.config'
const TTL_MS = 15_000

// Pequeño caché por instancia: la cotización del carrito se pide seguido y los ajustes cambian poco.
let cache = null

export async function getStoreConfig() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value
  const value = readStoreConfig(await getSetting(KEY))
  cache = { value, at: Date.now() }
  return value
}

export async function saveStoreConfig(input) {
  const value = storeConfigSchema.parse(input)
  await setSetting(KEY, JSON.stringify(value))
  cache = { value, at: Date.now() }
  return value
}
