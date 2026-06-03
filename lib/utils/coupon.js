import { prisma } from '../config/prisma.js'

export async function validateCoupon(code, cartTotal) {
  if (!code) return { valid: false, error: 'Código requerido' }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon) return { valid: false, error: 'Código inválido' }
  if (!coupon.isActive) return { valid: false, error: 'Cupón desactivado' }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: 'Cupón expirado' }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, error: 'Cupón agotado' }

  const total = cartTotal || 0
  if (total < coupon.minTotal) return { valid: false, error: `Mínimo $${(coupon.minTotal * 1000).toLocaleString('es-CL')}` }

  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.round(total * (coupon.value / 100))
  } else {
    discount = Math.min(coupon.value, total)
  }

  return { valid: true, discount, code: coupon.code, type: coupon.type, value: coupon.value }
}
