// Carga el producto y las capacitaciones iniciales. Idempotente: no pisa lo que se edite después en el admin.
// Uso: npm run db:seed
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PACKS = [
  { units: 1, price: 30000 },
  { units: 3, price: 75000 },
  { units: 10, price: 222000 },
]

const product = {
  slug: 'down-permanent',
  title: 'Down Permanent',
  brand: 'DASHU',
  subtitle: 'Alisado coreano para el pelo lateral rebelde',
  description:
    'DASHU Down Permanent es una solución capilar de origen coreano para controlar el pelo lateral que se levanta. ' +
    'Actúa sin plancha ni calor: con Cysteamine de bajo peso molecular y proteínas que cuidan la fibra, deja el cabello ' +
    'disciplinado y natural en unos 10 minutos, con un resultado que dura de 3 a 4 semanas.',
  howToUse:
    '1. Aplica sobre cabello seco en la zona lateral que quieres alisar, desde la raíz.\n' +
    '2. Peina el cabello hacia abajo y deja actuar 10 minutos.\n' +
    '3. Enjuaga con abundante agua y shampoo, seca y peina como siempre.',
  ingredients: 'Cysteamine de bajo peso molecular, proteína de seda, proteína de arroz, aceite de baobab.',
  category: 'alisado',
  images: ['/img/product-hero.webp'],
  sortOrder: 0,
}

// Fechas confirmadas. Valor y cupos por definir en el admin (mientras tanto se reciben pre-inscripciones).
const noonChile = (key) => new Date(`${key}T15:00:00Z`)
const SEMINARS = [
  {
    slug: 'golden-barber-fest-melipilla',
    title: 'The Golden Barber Fest',
    kind: 'evento',
    city: 'Melipilla',
    date: noonChile('2026-10-18'),
    summary: 'Capacitación de alisado con DASHU Down Permanent en The Golden Barber Fest de Melipilla.',
  },
  {
    slug: 'seminario-color-y-alisado-iquique',
    title: 'Seminario de color y alisado',
    kind: 'seminario',
    city: 'Iquique',
    host: 'Jhonal Castillo',
    date: noonChile('2026-11-15'),
    summary: 'Seminario de color y alisado junto a Jhonal Castillo.',
  },
  {
    slug: 'clase-practica-alisado-iquique',
    title: 'Clase práctica privada de alisado',
    kind: 'clase',
    city: 'Iquique',
    date: noonChile('2026-11-16'),
    summary: 'Clase práctica privada para aprender y aplicar la técnica de alisado con DASHU Down Permanent.',
  },
  {
    slug: 'seminario-alisado-antofagasta-am',
    title: 'Seminario de alisado',
    kind: 'seminario',
    city: 'Antofagasta',
    venue: 'Bemol Barbería',
    host: 'Bemol Barbería con Angelito',
    scheduleNote: 'Bloque AM',
    date: noonChile('2026-11-22'),
    summary: 'Seminario de alisado en Bemol Barbería (bloque de la mañana).',
  },
  {
    slug: 'curso-practico-alisado-antofagasta-pm',
    title: 'Curso práctico de alisado',
    kind: 'curso',
    city: 'Antofagasta',
    venue: 'Bemol Barbería',
    host: 'Bemol Barbería con Angelito',
    scheduleNote: 'Bloque PM',
    date: noonChile('2026-11-22'),
    summary: 'Curso práctico de alisado en Bemol Barbería (bloque de la tarde).',
  },
]

async function main() {
  const saved = await prisma.product.upsert({
    where: { slug: product.slug },
    create: { ...product, stock: 200, packs: { create: PACKS } },
    update: {},
  })
  for (const pack of PACKS) {
    await prisma.pack.upsert({
      where: { productId_units: { productId: saved.id, units: pack.units } },
      create: { ...pack, productId: saved.id },
      update: {},
    })
  }
  console.log(`Producto listo: ${saved.title} (id ${saved.id})`)

  for (const s of SEMINARS) {
    await prisma.seminar.upsert({ where: { slug: s.slug }, create: { ...s, price: null, capacity: 20 }, update: {} })
  }
  console.log(`Capacitaciones listas: ${SEMINARS.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
