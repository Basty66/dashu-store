import { z } from 'zod'
import { prisma } from './prisma.js'
import { HttpError } from './http.js'

export function serializeProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    subtitle: product.subtitle,
    description: product.description,
    howToUse: product.howToUse,
    ingredients: product.ingredients,
    contentSize: product.contentSize,
    category: product.category,
    images: product.images,
    stock: product.stock,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    packs: [...product.packs]
      .sort((a, b) => a.units - b.units)
      .map((p) => ({ id: p.id, units: p.units, price: p.price, isActive: p.isActive })),
  }
}

export async function listProducts({ includeInactive = false } = {}) {
  const products = await prisma.product.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: { packs: includeInactive ? true : { where: { isActive: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return products.filter((p) => includeInactive || p.packs.length > 0).map(serializeProduct)
}

export async function getProduct(slugOrId) {
  const id = /^\d+$/.test(slugOrId) ? Number(slugOrId) : null
  const product = await prisma.product.findFirst({
    where: { isActive: true, ...(id ? { id } : { slug: slugOrId }) },
    include: { packs: { where: { isActive: true } } },
  })
  if (!product || product.packs.length === 0) throw new HttpError(404, 'Producto no encontrado')
  return serializeProduct(product)
}

// ---------- Admin ----------

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const packSchema = z.object({
  units: z.number().int().min(1).max(1000),
  price: z.number().int().min(1, 'El precio debe ser mayor a 0').max(100_000_000),
  isActive: z.boolean().default(true),
})

const imageUrl = z.string().max(500).refine((v) => v.startsWith('/') || v.startsWith('https://'), 'URL de imagen no válida')

const productFields = {
  title: z.string().trim().min(2, 'Ingresa el nombre').max(120),
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, 'Solo minúsculas, números y guiones').optional(),
  brand: z.string().trim().max(40).default('DASHU'),
  subtitle: z.string().trim().max(160).default(''),
  description: z.string().trim().min(10, 'Escribe una descripción').max(5000),
  howToUse: z.string().trim().max(5000).default(''),
  ingredients: z.string().trim().max(3000).default(''),
  contentSize: z.string().trim().max(40).default(''),
  category: z.string().trim().max(40).default('alisado'),
  images: z.array(imageUrl).max(12).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  packs: z
    .array(packSchema)
    .min(1, 'Agrega al menos un formato de venta')
    .max(10)
    .refine((packs) => new Set(packs.map((p) => p.units)).size === packs.length, 'Hay formatos repetidos'),
}

const createSchema = z.object({ ...productFields, stock: z.number().int().min(0).max(1_000_000).default(0) })
const updateSchema = z.object({ ...productFields, stockDelta: z.number().int().min(-1_000_000).max(1_000_000).default(0) })

export async function createProduct(input) {
  const { packs, ...data } = createSchema.parse(input)
  data.slug = data.slug || slugify(data.title)
  await ensureSlugFree(data.slug)
  const product = await prisma.product.create({
    data: { ...data, packs: { create: packs } },
    include: { packs: true },
  })
  return serializeProduct(product)
}

export async function updateProduct(id, input) {
  const { packs, stockDelta, ...data } = updateSchema.parse(input)
  data.slug = data.slug || slugify(data.title)
  await ensureSlugFree(data.slug, id)

  const product = await prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Producto no encontrado')
    if (stockDelta < 0 && existing.stock + stockDelta < 0) {
      throw new HttpError(400, `No puedes descontar ${-stockDelta}: el stock actual es ${existing.stock}`)
    }
    await tx.product.update({
      where: { id },
      data: { ...data, ...(stockDelta ? { stock: { increment: stockDelta } } : {}) },
    })
    await tx.pack.deleteMany({ where: { productId: id, units: { notIn: packs.map((p) => p.units) } } })
    for (const pack of packs) {
      await tx.pack.upsert({
        where: { productId_units: { productId: id, units: pack.units } },
        create: { ...pack, productId: id },
        update: { price: pack.price, isActive: pack.isActive },
      })
    }
    return tx.product.findUnique({ where: { id }, include: { packs: true } })
  })
  return serializeProduct(product)
}

async function ensureSlugFree(slug, exceptId) {
  if (!slug) throw new HttpError(400, 'El nombre debe tener letras o números')
  const other = await prisma.product.findUnique({ where: { slug } })
  if (other && other.id !== exceptId) {
    throw new HttpError(400, 'Ya existe un producto con esa URL', { fields: { slug: 'Ya está en uso' } })
  }
}

// Si el producto tiene ventas se archiva (se oculta) para no perder el historial.
export async function deleteProduct(id) {
  const sales = await prisma.orderItem.count({ where: { productId: id } })
  if (sales > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } })
    return { archived: true }
  }
  await prisma.product.delete({ where: { id } })
  return { deleted: true }
}

const MAX_IMAGE_BYTES = 1_500_000

export async function saveImage(dataUrl) {
  const match = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''))
  if (!match) throw new HttpError(400, 'Formato de imagen no soportado (usa JPG, PNG o WebP)')
  const data = Buffer.from(match[2], 'base64')
  if (data.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'La imagen pesa demasiado (máx. 1,5 MB)')
  const image = await prisma.productImage.create({ data: { data, mimeType: match[1] } })
  return { url: `/api/images/${image.id}` }
}
