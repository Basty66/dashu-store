import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

// Products routes
app.get('/api/products', async (req, res) => {
  const { type, client, store } = await import('../db.js').then(m => m.getStore())
  if (type === 'supabase') {
    const { data, error } = await client.from('products').select('*').eq('is_active', true)
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  res.json(store.products.filter(p => p.is_active))
})

app.get('/api/products/:id', async (req, res) => {
  const { type, client, store } = await import('../db.js').then(m => m.getStore())
  if (type === 'supabase') {
    const { data, error } = await client.from('products').eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'Producto no encontrado' })
    return res.json(data)
  }
  const product = store.products.find(p => p.id === Number(req.params.id))
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(product)
})

// Orders routes
app.post('/api/orders', async (req, res) => {
  const { type, client, store } = await import('../db.js').then(m => m.getStore())
  const { name, email, phone, region, city, address, items, total } = req.body
  const orderNumber = (await import('../db.js')).generateOrderNumber()

  if (type === 'supabase') {
    const { data: order, error } = await client.from('orders').insert({
      order_number: orderNumber, customer_name: name, customer_email: email,
      customer_phone: phone, shipping_region: region, shipping_city: city,
      shipping_address: address, total, status: 'pending', payment_method: 'webpay',
    }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    const orderItems = items.map(i => ({ order_id: order.id, ...i }))
    await client.from('order_items').insert(orderItems)
    return res.json(order)
  }

  // Memory fallback
  const order = {
    id: store.nextOrderId++, order_number: orderNumber, customer_name: name,
    customer_email: email, customer_phone: phone, shipping_region: region,
    shipping_city: city, shipping_address: address, total, status: 'pending',
    payment_method: 'webpay', created_at: new Date().toISOString(),
  }
  store.orders.push(order)
  items.forEach(i => {
    store.orderItems.push({ id: store.nextItemId++, order_id: order.id, ...i })
  })
  res.json(order)
})

app.get('/api/orders/:orderNumber', async (req, res) => {
  const { type, client, store } = await import('../db.js').then(m => m.getStore())
  if (type === 'supabase') {
    const { data: order, error } = await client.from('orders').eq('order_number', req.params.orderNumber).single()
    if (error) return res.status(404).json({ error: 'Orden no encontrada' })
    const { data: items } = await client.from('order_items').select('*').eq('order_id', order.id)
    return res.json({ ...order, items })
  }
  const order = store.orders.find(o => o.order_number === req.params.orderNumber)
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' })
  order.items = store.orderItems.filter(i => i.order_id === order.id)
  res.json(order)
})

// Webpay routes
app.post('/api/webpay/create', async (req, res) => {
  const { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = await import('transbank-sdk')
  const { orderNumber, amount, sessionId } = req.body

  try {
    const tx = new WebpayPlus.Transaction(new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration,
    ))
    const returnUrl = `${req.protocol}://${req.get('host')}/api/webpay/return`
    const response = await tx.create(orderNumber, sessionId, amount, returnUrl)
    res.json({ token: response.token, url: response.url })
  } catch (err) {
    console.error('Webpay create error:', err)
    res.status(500).json({ error: 'Error al iniciar transacción Webpay' })
  }
})

app.post('/api/webpay/commit', async (req, res) => {
  const { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = await import('transbank-sdk')
  const { token } = req.body
  try {
    const tx = new WebpayPlus.Transaction(new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration,
    ))
    const response = await tx.commit(token)

    // Update order status and deduct stock
    const { type, client, store } = await import('../db.js').then(m => m.getStore())
    if (response.status === 'AUTHORIZED') {
      if (type === 'supabase') {
        await client.from('orders').update({ status: 'paid', webpay_token: token }).eq('order_number', response.buy_order)
        const { data: order } = await client.from('orders').eq('order_number', response.buy_order).single()
        if (order) {
          const { data: items } = await client.from('order_items').select('*').eq('order_id', order.id)
          for (const item of items) {
            await client.rpc('decrement_stock', { pid: item.product_id, qty: item.quantity })
          }
        }
      } else {
        const order = store.orders.find(o => o.order_number === response.buy_order)
        if (order) {
          order.status = 'paid'
          order.webpay_token = token
          const items = store.orderItems.filter(i => i.order_id === order.id)
          for (const item of items) {
            const product = store.products.find(p => p.id === item.product_id)
            if (product) product.stock -= item.quantity
          }
        }
      }
    }

    res.json({
      status: response.status,
      buyOrder: response.buy_order,
      amount: response.amount,
      accountingDate: response.accounting_date,
      transactionDate: response.transaction_date,
      authorizationCode: response.authorization_code,
      paymentTypeCode: response.payment_type_code,
      installmentsNumber: response.installments_number,
      installmentsAmount: response.installments_amount,
    })
  } catch (err) {
    console.error('Webpay commit error:', err)
    res.status(500).json({ error: 'Error al confirmar transacción Webpay' })
  }
})

// Webpay return URL (redirect handler)
app.all('/api/webpay/return', async (req, res) => {
  const token = req.body?.token_ws || req.query?.token_ws
  if (!token) {
    return res.redirect('/checkout?error=missing_token')
  }
  try {
    const commitRes = await fetch(`${req.protocol}://${req.get('host')}/api/webpay/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await commitRes.json()
    if (data.status === 'AUTHORIZED') {
      res.redirect(`/order/${data.buyOrder}`)
    } else {
      res.redirect(`/checkout?error=declined&order=${data.buyOrder}`)
    }
  } catch {
    res.redirect('/checkout?error=commit_failed')
  }
})

// For Vercel serverless
export default app
