import { z } from 'zod'
import { REGION_NAMES } from './chile.js'

// Ajustes de la tienda que Tomás edita en Admin → Ajustes. Se guardan como un JSON en la tabla
// Setting; mientras no se cambien rigen estos valores de lanzamiento.
export const DEFAULT_STORE_CONFIG = {
  announcements: [
    'Envío a todo Chile con seguimiento',
    'Packs de 3 y 10 cremas con precio por volumen',
    'Envío gratis desde $150.000',
    'Paga seguro con Mercado Pago',
  ],
  // WhatsApp solo con números y código de país (ej: 56912345678). Vacío = se oculta el botón.
  contact: { whatsapp: '', email: 'contacto@dashu.store', hours: 'Lunes a viernes, 10:00 a 18:00' },
  // Links completos a los perfiles. Vacío = no se muestra.
  social: { instagram: 'https://www.instagram.com/dashu.cl/', tiktok: '', facebook: '', youtube: '' },
  // Casos de antes y después (carrusel). "reference" = imagen referencial, no un cliente real.
  results: [
    { before: '/img/antes.webp', after: '/img/despues.webp', caption: 'Pelo lateral levantado → peinado en 10 minutos', reference: true },
  ],
  // Reels de Instagram para el carrusel de resultados (sección "Antes y después"). Máximo 8.
  reels: [],
  // Formato marcado como "Más elegido" (unidades). 0 = ninguno.
  highlightPackUnits: 3,
  // Programa de distribuidores: compra mínima por embalajes cerrados.
  distributor: { unitCost: 19000, unitsPerBox: 30, minBoxes: 3 },
  shipping: {
    // Envío gratis desde este subtotal (después de descuentos). null = desactivado.
    freeFrom: 150000,
    rates: {
      'Arica y Parinacota': 7000,
      'Tarapacá': 7000,
      'Antofagasta': 6000,
      'Atacama': 5000,
      'Coquimbo': 5000,
      'Valparaíso': 3000,
      'Metropolitana de Santiago': 3000,
      "Libertador General Bernardo O'Higgins": 3000,
      'Maule': 4000,
      'Ñuble': 4000,
      'Biobío': 4000,
      'La Araucanía': 5000,
      'Los Ríos': 5000,
      'Los Lagos': 6000,
      'Aysén del General Carlos Ibáñez del Campo': 8000,
      'Magallanes y de la Antártica Chilena': 10000,
    },
  },
}

const profileUrl = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === '' || /^https:\/\/\S+$/.test(v), 'Pega el link completo (https://…)')

// Link de un reel o publicación de Instagram -> { type, code }. null si no es un link válido.
export function parseInstagramUrl(url) {
  const match = /^https:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([\w-]{5,40})\/?(?:\?.*)?$/.exec(String(url || '').trim())
  if (!match) return null
  return { type: match[1] === 'reels' ? 'reel' : match[1], code: match[2] }
}

// Dirección del reproductor oficial de Instagram para ese reel o publicación.
export function instagramEmbedUrl(url) {
  const post = parseInstagramUrl(url)
  return post ? `https://www.instagram.com/${post.type}/${post.code}/embed/` : null
}

// Imagen de la tienda: subida desde el admin (/api/images/…), del sitio (/img/…) o externa https.
const imageRef = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v.startsWith('/api/images/') || v.startsWith('/img/') || /^https:\/\/\S+$/.test(v), 'Sube la imagen')

const resultSchema = z.object({
  before: imageRef,
  after: imageRef,
  caption: z.string().trim().max(90, 'Máximo 90 caracteres').default(''),
  reference: z.boolean().default(false),
})

const reelSchema = z.object({
  url: z.string().trim().refine((v) => parseInstagramUrl(v) !== null, 'Pega el link del reel (instagram.com/reel/…)'),
  caption: z.string().trim().max(80, 'Máximo 80 caracteres').default(''),
  cover: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || v.startsWith('/api/images/') || /^https:\/\/\S+$/.test(v), 'Imagen no válida')
    .default(''),
})

const amount = (max, message = 'Ingresa un monto válido') => z.number({ invalid_type_error: message }).int(message).min(0, message).max(max, message)

export const storeConfigSchema = z.object({
  announcements: z
    .array(z.string().trim().min(3, 'Escribe el mensaje').max(70, 'Máximo 70 caracteres'))
    .min(1, 'Deja al menos un mensaje')
    .max(6, 'Máximo 6 mensajes'),
  contact: z.object({
    whatsapp: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s+()-]/g, ''))
      .pipe(z.string().regex(/^(\d{8,15})?$/, 'Solo números con código de país. Ej: 56912345678')),
    email: z.string().trim().email('Email no válido').max(120),
    hours: z.string().trim().max(80),
  }),
  social: z.object({ instagram: profileUrl, tiktok: profileUrl, facebook: profileUrl, youtube: profileUrl }),
  results: z.array(resultSchema).min(1, 'Deja al menos un caso').max(8, 'Máximo 8 casos'),
  reels: z.array(reelSchema).max(8, 'Máximo 8 reels'),
  highlightPackUnits: z.number().int().min(0).max(1000),
  distributor: z.object({
    unitCost: amount(10_000_000).refine((v) => v > 0, 'Debe ser mayor a 0'),
    unitsPerBox: z.number().int().min(1, 'Mínimo 1').max(1000),
    minBoxes: z.number().int().min(1, 'Mínimo 1').max(1000),
  }),
  shipping: z.object({
    freeFrom: amount(100_000_000).nullable(),
    rates: z.object(Object.fromEntries(REGION_NAMES.map((region) => [region, amount(1_000_000)]))),
  }),
})

// Lee lo guardado en la base. Completa con los valores por defecto lo que falte (por ejemplo,
// un ajuste nuevo agregado después) y si una sección no es válida usa la de por defecto,
// sin perder el resto de lo guardado.
export function readStoreConfig(raw) {
  let saved = {}
  try {
    saved = typeof raw === 'string' ? JSON.parse(raw) : raw || {}
  } catch {
    saved = {}
  }
  const d = DEFAULT_STORE_CONFIG
  const merged = {
    announcements: saved.announcements ?? d.announcements,
    contact: { ...d.contact, ...saved.contact },
    social: { ...d.social, ...saved.social },
    results: saved.results ?? d.results,
    reels: saved.reels ?? d.reels,
    highlightPackUnits: saved.highlightPackUnits ?? d.highlightPackUnits,
    distributor: { ...d.distributor, ...saved.distributor },
    shipping: {
      freeFrom: saved.shipping && 'freeFrom' in saved.shipping ? saved.shipping.freeFrom : d.shipping.freeFrom,
      rates: { ...d.shipping.rates, ...saved.shipping?.rates },
    },
  }
  const config = {}
  for (const [key, schema] of Object.entries(storeConfigSchema.shape)) {
    const parsed = schema.safeParse(merged[key])
    config[key] = parsed.success ? parsed.data : structuredClone(d[key])
  }
  return config
}

// Pedido mínimo del programa de distribuidores.
export function distributorMinimum({ unitCost, unitsPerBox, minBoxes }) {
  const units = unitsPerBox * minBoxes
  return { units, total: units * unitCost }
}

// Costo de despacho a una región. null si la región no existe.
export function shippingCostFor(shipping, region, subtotalAfterDiscount) {
  if (!region || !Object.hasOwn(shipping.rates, region)) return null
  if (shipping.freeFrom !== null && subtotalAfterDiscount >= shipping.freeFrom) return 0
  return shipping.rates[region]
}

// "@usuario" a partir del link del perfil de Instagram (para mostrarlo en la tienda).
export function instagramHandle(url) {
  const match = /instagram\.com\/([\w.]+)/.exec(String(url || ''))
  return match ? `@${match[1]}` : null
}
