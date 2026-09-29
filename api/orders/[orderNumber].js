import { z } from 'zod'
import { handler, methodNotAllowed, body, HttpError } from '../../lib/http.js'
import { findOrderForCustomer, publicOrder } from '../../lib/orders.js'

// GET  /api/orders/:orderNumber?t=TOKEN   -> estado y seguimiento (link privado del pedido)
// POST /api/orders/:orderNumber {email}   -> búsqueda desde "Seguir mi pedido" (el email no viaja en la URL)
export default handler(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  const { orderNumber, t } = req.query || {}

  if (req.method === 'GET') {
    if (!t) throw new HttpError(400, 'Falta el código de acceso del pedido')
    return res.status(200).json(publicOrder(await findOrderForCustomer(orderNumber, { token: String(t) })))
  }
  if (req.method === 'POST') {
    const { email } = z.object({ email: z.string().trim().email('Ingresa un email válido') }).parse(body(req))
    return res.status(200).json(publicOrder(await findOrderForCustomer(orderNumber, { email })))
  }
  return methodNotAllowed(res)
})
