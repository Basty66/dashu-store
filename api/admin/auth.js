import { generateToken } from '../config/auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { password } = req.body
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD no configurada' })
    }

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    const token = generateToken()

    return res.status(200).json({ token, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
