import { validateCoupon } from '../utils/coupon.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { code, cartTotal } = req.body
    const result = await validateCoupon(code, cartTotal)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
