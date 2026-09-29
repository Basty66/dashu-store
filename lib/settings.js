import { prisma } from './prisma.js'

export async function getSetting(key) {
  return (await prisma.setting.findUnique({ where: { key } }))?.value ?? null
}

export async function setSetting(key, value) {
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
}

export async function deleteSettings(keys) {
  await prisma.setting.deleteMany({ where: { key: { in: keys } } })
}
