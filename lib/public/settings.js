import { methodNotAllowed } from '../http.js'
import { getStoreConfig } from '../storeConfig.js'

// GET /api/settings — ajustes públicos de la tienda (envíos, distribuidores, anuncios, redes...).
export default async function settings(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300')
  return res.status(200).json(await getStoreConfig())
}
