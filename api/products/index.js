import { handler, pathSegments, methodNotAllowed } from '../../lib/http.js'
import { listProducts, getProduct } from '../../lib/catalog.js'

// GET /api/products            -> catálogo activo con sus formatos de venta
// GET /api/products/:slug|:id  -> detalle
export default handler(async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(res)
  const [slugOrId] = pathSegments(req, /^\/api\/products\/?/)
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60')
  if (slugOrId) return res.status(200).json(await getProduct(slugOrId))
  return res.status(200).json(await listProducts())
})
