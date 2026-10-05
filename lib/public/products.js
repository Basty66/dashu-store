import { methodNotAllowed } from '../http.js'
import { listProducts, getProduct } from '../catalog.js'

// GET /api/products            -> catálogo activo con sus formatos de venta
// GET /api/products/:slug|:id  -> detalle
export default async function products(req, res, [slugOrId]) {
  if (req.method !== 'GET') return methodNotAllowed(res)
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60')
  if (slugOrId) return res.status(200).json(await getProduct(slugOrId))
  return res.status(200).json(await listProducts())
}
