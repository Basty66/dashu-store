import { handler, pathSegments, HttpError } from '../lib/http.js'
import products from '../lib/public/products.js'
import images from '../lib/public/images.js'
import contact from '../lib/public/contact.js'
import reviews from '../lib/public/reviews.js'
import distributors from '../lib/public/distributors.js'
import health from '../lib/public/health.js'
import settings from '../lib/public/settings.js'

// Endpoints públicos chicos en una sola función (el plan Hobby de Vercel admite 12 por despliegue).
// vercel.json reescribe /api/products, /api/images, /api/contact, ... hacia aquí y la URL original
// se conserva, así que cada ruta sigue respondiendo en la misma dirección de siempre.
const routes = { products, images, contact, reviews, distributors, health, settings }

export default handler(async (req, res) => {
  const [section, ...rest] = pathSegments(req, /^\/api\/?/)
  const route = Object.hasOwn(routes, section) ? routes[section] : null
  if (!route) throw new HttpError(404, 'No encontrado')
  return route(req, res, rest)
})
