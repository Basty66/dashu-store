import { prisma } from '../config/prisma.js'

export async function validateStock(items) {
  const errors = []
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.id } })
    if (!product) {
      errors.push({ id: item.id, title: item.title || 'Producto', error: 'Producto no encontrado' })
      continue
    }
    if (product.stock < item.quantity) {
      errors.push({
        id: item.id,
        title: product.title,
        available: product.stock,
        requested: item.quantity,
        error: `"${product.title}" tiene solo ${product.stock} unidad(es) disponible(s) y solicitaste ${item.quantity}`,
      })
    }
  }
  return errors
}
