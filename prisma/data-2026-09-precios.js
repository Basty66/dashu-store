// Migración de datos (una vez): renombra el producto a "DASHU Down Permanent" y deja los formatos 1, 3 y 10
// con los precios definidos por el negocio. Los packs 5/20/40 se desactivan (no se borran por si tienen ventas).
// Uso: node prisma/data-2026-09-precios.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const PRICES = { 1: 30000, 3: 75000, 10: 222000 }

async function main() {
  const product = await prisma.product.findFirst({ where: { slug: { in: ['protein-down-cream', 'down-permanent'] } } })
  if (!product) throw new Error('No encontré el producto')
  await prisma.product.update({
    where: { id: product.id },
    data: {
      slug: 'down-permanent',
      title: 'Down Permanent',
      subtitle: 'Alisado coreano para el pelo lateral rebelde',
      description:
        'DASHU Down Permanent es una solución capilar de origen coreano para controlar el pelo lateral que se levanta. ' +
        'Actúa sin plancha ni calor: con Cysteamine de bajo peso molecular y proteínas que cuidan la fibra, deja el cabello ' +
        'disciplinado y natural en unos 10 minutos, con un resultado que dura de 3 a 4 semanas.',
    },
  })
  for (const [units, price] of Object.entries(PRICES)) {
    await prisma.pack.upsert({
      where: { productId_units: { productId: product.id, units: Number(units) } },
      create: { productId: product.id, units: Number(units), price, isActive: true },
      update: { price, isActive: true },
    })
  }
  await prisma.pack.updateMany({ where: { productId: product.id, units: { notIn: Object.keys(PRICES).map(Number) } }, data: { isActive: false } })
  const packs = await prisma.pack.findMany({ where: { productId: product.id }, orderBy: { units: 'asc' } })
  console.log('Producto:', product.id, packs.map((p) => `${p.units}u=${p.price}${p.isActive ? '' : ' (oculto)'}`).join(', '))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
