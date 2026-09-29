// Carga el producto inicial con sus formatos de venta. Idempotente: se puede correr varias veces.
// Uso: npm run db:seed
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PRECIOS DE EJEMPLO: ajústalos desde el admin (Productos → Editar) antes de vender.
const PACKS = [
  { units: 1, price: 14000 },
  { units: 5, price: 62500 },
  { units: 10, price: 115000 },
  { units: 20, price: 210000 },
  { units: 40, price: 380000 },
]

const product = {
  slug: 'protein-down-cream',
  title: 'Protein Down Cream',
  brand: 'DASHU',
  subtitle: 'Crema alisadora coreana para el pelo lateral rebelde',
  description:
    'Crema de alisado de origen coreano pensada para domar el pelo lateral que se levanta. ' +
    'Su fórmula con Cysteamine de bajo peso molecular actúa sin plancha ni calor, mientras la proteína de seda ' +
    'y de arroz nutren la fibra capilar. Resultado disciplinado y natural en unos 10 minutos, que dura de 3 a 4 semanas.',
  howToUse:
    '1. Aplica sobre cabello seco en la zona lateral que quieres alisar, desde la raíz.\n' +
    '2. Peina el cabello hacia abajo y deja actuar 10 minutos.\n' +
    '3. Enjuaga con abundante agua y shampoo, seca y peina como siempre.',
  ingredients: 'Cysteamine de bajo peso molecular, proteína de seda, proteína de arroz, aceite de baobab.',
  contentSize: '',
  category: 'alisado',
  images: ['/img/product-hero.webp'],
  stock: 200,
  sortOrder: 0,
}

async function main() {
  const { stock, ...fields } = product
  const saved = await prisma.product.upsert({
    where: { slug: product.slug },
    create: { ...fields, stock, packs: { create: PACKS } },
    update: fields,
  })
  for (const pack of PACKS) {
    await prisma.pack.upsert({
      where: { productId_units: { productId: saved.id, units: pack.units } },
      create: { ...pack, productId: saved.id },
      update: {},
    })
  }
  console.log(`Producto listo: ${saved.title} (id ${saved.id})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
