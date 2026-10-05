import { z } from 'zod'
import { prisma } from './prisma.js'
import { HttpError } from './http.js'
import { hashPassword, verifyPassword } from './password.js'
import { emailSchema, passwordSchema, publicAdmin } from './auth.js'

const nameSchema = z.string().trim().min(2, 'Ingresa un nombre').max(60)

function teamMember(user) {
  return { ...publicAdmin(user), isActive: user.isActive, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt }
}

// ---------- Mi cuenta ----------

const accountSchema = z
  .object({
    name: nameSchema,
    currentPassword: z.string().max(128).optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine((v) => !v.newPassword || v.currentPassword, { path: ['currentPassword'], message: 'Ingresa tu contraseña actual' })

// Cambia nombre y/o contraseña. Con clave nueva se cierran las otras sesiones (sube sessionVersion).
export async function updateAccount(user, input) {
  const data = accountSchema.parse(input)
  const patch = { name: data.name }
  if (data.newPassword) {
    if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
      throw new HttpError(400, 'La contraseña actual no es correcta', { fields: { currentPassword: 'No coincide' } })
    }
    if (data.newPassword.toLowerCase().includes(user.email.split('@')[0].toLowerCase())) {
      throw new HttpError(400, 'La contraseña no puede contener tu correo', { fields: { newPassword: 'Elige otra contraseña' } })
    }
    Object.assign(patch, { passwordHash: await hashPassword(data.newPassword), mustChangePassword: false, sessionVersion: { increment: 1 } })
  } else if (user.mustChangePassword) {
    throw new HttpError(400, 'Crea tu nueva contraseña para continuar', { fields: { newPassword: 'Requerida' } })
  }
  return prisma.adminUser.update({ where: { id: user.id }, data: patch })
}

// ---------- Equipo (solo dueño) ----------

export async function listTeam() {
  const users = await prisma.adminUser.findMany({ orderBy: [{ role: 'desc' }, { createdAt: 'asc' }] })
  return users.map(teamMember)
}

const memberSchema = z.object({ name: nameSchema, email: emailSchema, password: passwordSchema })

// La persona entra con la clave temporal que le da el dueño y debe cambiarla al ingresar.
export async function createMember(input) {
  const data = memberSchema.parse(input)
  if (await prisma.adminUser.findUnique({ where: { email: data.email } })) {
    throw new HttpError(400, 'Ya existe una cuenta con ese correo', { fields: { email: 'Ya registrado' } })
  }
  const user = await prisma.adminUser.create({
    data: { name: data.name, email: data.email, passwordHash: await hashPassword(data.password), mustChangePassword: true },
  })
  return teamMember(user)
}

const memberPatch = z.object({ isActive: z.boolean().optional(), password: passwordSchema.optional() })

// Activar/desactivar o poner una clave temporal nueva. Ambas cierran las sesiones de esa persona.
export async function updateMember(owner, id, input) {
  const data = memberPatch.parse(input)
  if (id === owner.id) throw new HttpError(400, 'Tu propia cuenta se edita en Mi cuenta')
  const target = await prisma.adminUser.findUnique({ where: { id } })
  if (!target) throw new HttpError(404, 'Cuenta no encontrada')
  const patch = { sessionVersion: { increment: 1 }, failedLogins: 0, lockedUntil: null }
  if (data.isActive !== undefined) patch.isActive = data.isActive
  if (data.password) Object.assign(patch, { passwordHash: await hashPassword(data.password), mustChangePassword: true })
  return teamMember(await prisma.adminUser.update({ where: { id }, data: patch }))
}
