import { prisma } from '../../lib/config/prisma.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !message) return res.status(400).json({ error: 'Faltan campos requeridos' })
    const msg = await prisma.contactMessage.create({ data: { name, email, subject: subject || '', message } })
    return res.status(201).json({ success: true, id: msg.id })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
