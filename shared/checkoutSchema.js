// Validación del checkout, usada igual en el navegador y en el servidor.
import { z } from 'zod'
import { REGION_NAMES, isValidCommune } from './chile.js'
import { isValidRut } from './rut.js'

export const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  packUnits: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
})

export const cartSchema = z.array(cartItemSchema).min(1, 'Tu carrito está vacío').max(30)

const digits = (value) => value.replace(/\D/g, '')

export const customerSchema = z
  .object({
    name: z.string().trim().min(3, 'Ingresa tu nombre y apellido').max(80),
    email: z.string().trim().toLowerCase().email('Ingresa un email válido').max(120),
    phone: z
      .string()
      .trim()
      .refine((v) => digits(v).length >= 8 && digits(v).length <= 12, 'Ingresa un teléfono válido'),
    region: z.string().refine((r) => REGION_NAMES.includes(r), 'Selecciona una región'),
    commune: z.string().min(1, 'Selecciona una comuna'),
    address: z.string().trim().min(5, 'Ingresa calle, número y depto si aplica').max(160),
    notes: z.string().trim().max(300).optional().default(''),
    documentType: z.enum(['boleta', 'factura']).default('boleta'),
    rut: z.string().trim().max(15).optional().default(''),
    businessName: z.string().trim().max(120).optional().default(''),
    businessActivity: z.string().trim().max(120).optional().default(''),
  })
  .superRefine((c, ctx) => {
    if (c.region && c.commune && !isValidCommune(c.region, c.commune)) {
      ctx.addIssue({ code: 'custom', path: ['commune'], message: 'Selecciona una comuna de la región' })
    }
    if (c.rut && !isValidRut(c.rut)) {
      ctx.addIssue({ code: 'custom', path: ['rut'], message: 'RUT no válido' })
    }
    if (c.documentType === 'factura') {
      if (!c.rut) ctx.addIssue({ code: 'custom', path: ['rut'], message: 'La factura requiere RUT de empresa' })
      if (!c.businessName) ctx.addIssue({ code: 'custom', path: ['businessName'], message: 'Ingresa la razón social' })
      if (!c.businessActivity) ctx.addIssue({ code: 'custom', path: ['businessActivity'], message: 'Ingresa el giro' })
    }
  })

export const checkoutSchema = z.object({
  items: cartSchema,
  customer: customerSchema,
  couponCode: z.string().trim().max(40).optional().nullable(),
})

export const quoteSchema = z.object({
  items: cartSchema,
  region: z.string().optional().nullable(),
  couponCode: z.string().trim().max(40).optional().nullable(),
})

// Convierte los errores de zod en { campo: mensaje } para mostrarlos junto a cada input.
export function fieldErrors(error) {
  const out = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
