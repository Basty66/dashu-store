import express from 'express'

const app = express()
app.use(express.json())

const memStore = {
  products: [{
    id: 1, name: 'Protein Down Cream 120ml', slug: 'protein-down-cream-120ml',
    description: 'Crema alisadora coreana para el cabello masculino. Alisa, nutre y controla el frizz con proteínas de rápida absorción. Sin químicos agresivos.',
    price: 24990, stock: 42, sku: 'DPC-120',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx7tL40DbjW5GvbgDJVMNpu2XYaVj5IBcX5JzmK4ndbMaC4tDyw1e_H2kkskVH3X37AAHHqnc6oN1fAXiPsR2Ydi84PWaMqoEn1sUNYqiucVCEpC6K2dA4JcWh2LsTvnttWKw6lxKtDHr2s854Wog4RXDw6H1waPc6Dacdn6-PKR83TTzFocY5xxHkkOVWzY-RrQvtGpSB_cQbdsMBgIYDodlQWq-b7sU8U9ygamoLCnPuFKnDFI6-JHLsMkWjPxEZrKAkD6-MHaA',
    is_active: true, created_at: new Date().toISOString(),
  }],
  orders: [], orderItems: [], nextOrderId: 1, nextItemId: 1,
}

let orderCounter = 0

const orderNumber = () => {
  orderCounter++
  return `DSH-${String(orderCounter).padStart(5, '0')}`
}

const trackingNumber = () => {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `STK-${n}`
}

app.get('/api/products', (req, res) => {
  res.json(memStore.products.filter(p => p.is_active))
})

app.get('/api/products/:id', (req, res) => {
  const p = memStore.products.find(p => p.id === Number(req.params.id))
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(p)
})

app.post('/api/orders', (req, res) => {
  const { name, email, phone, region, commune, address, items, total } = req.body
  const num = orderNumber()
  const order = {
    id: memStore.nextOrderId++, order_number: num, customer_name: name,
    customer_email: email, customer_phone: phone, shipping_region: region,
    shipping_city: commune, shipping_address: address, total, status: 'paid',
    payment_method: req.body.paymentMethod || 'webpay', tracking_number: trackingNumber(),
    created_at: new Date().toISOString(),
  }
  memStore.orders.push(order)
  ;(items || []).forEach(i => {
    memStore.orderItems.push({ id: memStore.nextItemId++, order_id: order.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })
  })
  res.json(order)
})

app.get('/api/orders/:orderNumber', (req, res) => {
  const o = memStore.orders.find(o => o.order_number === req.params.orderNumber)
  if (!o) return res.status(404).json({ error: 'Orden no encontrada' })
  o.items = memStore.orderItems.filter(i => i.order_id === o.id)
  res.json(o)
})

app.post('/api/webpay/create', async (req, res) => {
  try {
    const { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = await import('transbank-sdk')
    const { orderNumber: buyOrder, amount, sessionId } = req.body
    const tx = new WebpayPlus.Transaction(new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration,
    ))
    const host = req.get('host')
    const proto = req.headers['x-forwarded-proto'] || req.protocol
    const returnUrl = `${proto}://${host}/api/webpay/return`
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl)
    res.json({ token: response.token, url: response.url })
  } catch (err) {
    console.error('Webpay create error:', err.message)
    res.status(500).json({ error: 'Error al iniciar transacción Webpay' })
  }
})

app.post('/api/webpay/commit', async (req, res) => {
  try {
    const { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = await import('transbank-sdk')
    const { token } = req.body
    const tx = new WebpayPlus.Transaction(new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration,
    ))
    const response = await tx.commit(token)
    if (response.status === 'AUTHORIZED') {
      const order = memStore.orders.find(o => o.order_number === response.buy_order)
      if (order) {
        order.status = 'paid'
        order.webpay_token = token
        const items = memStore.orderItems.filter(i => i.order_id === order.id)
        for (const item of items) {
          const product = memStore.products.find(p => p.id === item.product_id)
          if (product) product.stock -= item.quantity
        }
      }
    }
    res.json({
      status: response.status, buyOrder: response.buy_order, amount: response.amount,
      accountingDate: response.accounting_date, transactionDate: response.transaction_date,
      authorizationCode: response.authorization_code, paymentTypeCode: response.payment_type_code,
      installmentsNumber: response.installments_number, installmentsAmount: response.installments_amount,
    })
  } catch (err) {
    console.error('Webpay commit error:', err.message)
    res.status(500).json({ error: 'Error al confirmar transacción Webpay' })
  }
})

app.all('/api/webpay/return', async (req, res) => {
  const token = req.body?.token_ws || req.query?.token_ws
  if (!token) return res.redirect('/checkout?error=missing_token')
  try {
    const host = req.get('host')
    const proto = req.headers['x-forwarded-proto'] || req.protocol
    const commitRes = await fetch(`${proto}://${host}/api/webpay/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await commitRes.json()
    res.redirect(data.status === 'AUTHORIZED' ? `/order/${data.buyOrder}` : `/checkout?error=declined&order=${data.buyOrder}`)
  } catch { res.redirect('/checkout?error=commit_failed') }
})

app.post('/api/mercadopago/create', async (req, res) => {
  try {
    const { orderNumber, amount } = req.body
    const host = req.get('host')
    const proto = req.headers['x-forwarded-proto'] || req.protocol
    res.json({
      status: 'simulated',
      orderNumber,
      amount,
      redirect_url: `${proto}://${host}/order/${orderNumber}`,
      message: 'Mercado Pago simulated payment — order confirmed',
    })
  } catch (err) {
    console.error('Mercado Pago error:', err.message)
    res.status(500).json({ error: 'Error al procesar Mercado Pago' })
  }
})

export default app
