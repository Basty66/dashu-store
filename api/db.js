import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Using fallback in-memory store.')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// In-memory fallback for MVP demo when no Supabase is configured
const memStore = {
  products: [
    {
      id: 1, name: 'Protein Down Cream 120ml', slug: 'protein-down-cream-120ml',
      description: 'Crema hidratante con proteínas para el cuidado facial masculino.',
      price: 24990, stock: 100, sku: 'DPC-120',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
      is_active: true, created_at: new Date().toISOString(),
    },
  ],
  orders: [],
  orderItems: [],
  nextOrderId: 1,
  nextItemId: 1,
}

export function getStore() {
  return supabase ? { type: 'supabase', client: supabase } : { type: 'memory', store: memStore }
}

export function generateOrderNumber() {
  const num = String(memStore.nextOrderId).padStart(5, '0')
  return `DSH-${num}`
}
