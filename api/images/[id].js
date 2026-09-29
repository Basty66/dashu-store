import { prisma } from '../../lib/prisma.js'
import { handler, methodNotAllowed, parseId, HttpError } from '../../lib/http.js'

// GET /api/images/:id — imágenes subidas desde el admin. Inmutables: cache de 1 año.
export default handler(async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(res)
  const image = await prisma.productImage.findUnique({ where: { id: parseId(req.query.id) } })
  if (!image) throw new HttpError(404, 'Imagen no encontrada')
  res.setHeader('Content-Type', image.mimeType)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return res.status(200).send(Buffer.from(image.data))
})
