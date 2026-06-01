const API_BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
  },
  orders: {
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    get: (orderNumber) => request(`/orders/${orderNumber}`),
  },
  payments: {
    webpayCreate: (data) => request('/webpay/create', { method: 'POST', body: JSON.stringify(data) }),
    webpayCommit: (token) => request('/webpay/commit', { method: 'POST', body: JSON.stringify({ token }) }),
    mercadopagoCreate: (data) => request('/mercadopago/create', { method: 'POST', body: JSON.stringify(data) }),
  },
}
