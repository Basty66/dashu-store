import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Package, Truck, CheckCircle, Plus, Pencil, Trash2, ImagePlus, Tag, AlignLeft, Hash, Percent, Save, Calendar, Copy, Power, CreditCard, ChevronDown, ArrowUpDown, Eye, ShoppingBag, MessageSquare, ThumbsUp } from 'lucide-react'
import { clp } from '../lib/format'

const ADMIN_TOKEN_KEY = 'dashu_admin_token'

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY)}` }
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } })
  if (res.status === 401) {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    window.location.href = '/admin/login'
    throw new Error('No autorizado')
  }
  return res
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] } }),
}

const letterVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] } }),
}

function LetterReveal({ text, className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {text.split('').map((char, i) => (
        <motion.span key={i} custom={i} variants={letterVariants} initial="hidden" animate="visible"
          style={char === ' ' ? { width: '0.3em' } : {}}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('orders')

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [ventasFilter, setVentasFilter] = useState({ status: 'all', payment: 'all', sort: 'date', order: 'desc' })
  const [viewedSales, setViewedSales] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dashu_viewed_sales') || '[]') } catch { return [] }
  })

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imageInput, setImageInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'alisado', price: '', offerPrice: '', stock: '0', images: [] })
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: '', minTotal: '0', maxUses: '', expiresAt: '' })
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    localStorage.setItem('dashu_viewed_sales', JSON.stringify(viewedSales))
  }, [viewedSales])

  const markViewed = (id) => {
    setViewedSales(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const [toast, setToast] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (!token) { navigate('/admin/login', { replace: true }); return }
    fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('Invalid token'); return r.json() })
      .then(() => { setAuthenticated(true); setChecking(false) })
      .catch(() => { localStorage.removeItem(ADMIN_TOKEN_KEY); navigate('/admin/login', { replace: true }) })
  }, [navigate])

  useEffect(() => {
    if (!authenticated) return
    authFetch('/api/admin/orders').then(r => r.json()).then(data => { if (Array.isArray(data)) setOrders(data) }).catch(() => {}).finally(() => setLoading(false))
  }, [authenticated])

  const fetchCoupons = () => {
    setLoadingCoupons(true)
    authFetch('/api/admin/coupons').then(r => r.json()).then(data => { if (Array.isArray(data)) setCoupons(data) }).catch(() => {}).finally(() => setLoadingCoupons(false))
  }

  useEffect(() => {
    if (!authenticated || tab !== 'coupons') return
    fetchCoupons()
  }, [authenticated, tab])

  const fetchReviews = () => {
    setLoadingReviews(true)
    authFetch('/api/admin/reviews').then(r => r.json()).then(data => { if (Array.isArray(data)) setReviews(data) }).catch(() => {}).finally(() => setLoadingReviews(false))
  }

  useEffect(() => {
    if (!authenticated || tab !== 'reviews') return
    fetchReviews()
  }, [authenticated, tab])

  const fetchMessages = async () => {
    setLoadingMessages(true)
    try {
      const r = await authFetch('/api/admin/messages')
      const data = await r.json()
      if (Array.isArray(data)) setMessages(data)
    } catch {}
    setLoadingMessages(false)
  }

  const markRead = async (id) => {
    try {
      await authFetch('/api/admin/messages', { method: 'POST', body: JSON.stringify({ action: 'read', id }) })
      setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m))
    } catch {}
  }

  useEffect(() => {
    if (!authenticated || tab !== 'messages') return
    fetchMessages()
  }, [authenticated, tab])

  const approveReview = async (id, isApproved) => {
    try { await authFetch(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ isApproved }) }); fetchReviews(); showToast('Reseña actualizada') } catch {}
  }

  const deleteReview = async (id) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    try { await authFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }); fetchReviews(); showToast('Reseña eliminada') } catch {}
  }

  useEffect(() => {
    if (!authenticated || tab !== 'products') return
    fetchProducts()
  }, [authenticated, tab])

  useEffect(() => {
    if (!authenticated || tab !== 'ventas') return
    authFetch('/api/admin/orders').then(r => r.json()).then(data => { if (Array.isArray(data)) setOrders(data) }).catch(() => {})
  }, [authenticated, tab])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const fetchProducts = () => {
    setLoadingProducts(true)
    fetch('/api/products').then(r => r.json()).then(data => { if (Array.isArray(data)) setProducts(data) }).catch(() => {}).finally(() => setLoadingProducts(false))
  }

  const handleLogout = () => { localStorage.removeItem(ADMIN_TOKEN_KEY); navigate('/admin/login', { replace: true }) }

  const updateStatus = async (id, status) => {
    try { await authFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setOrders(orders.map(o => o.id === id ? { ...o, status } : o)); showToast('Estado actualizado') } catch {}
  }

  const openNewProduct = () => { setEditingProduct(null); setForm({ title: '', description: '', category: 'alisado', price: '', offerPrice: '', stock: '0', images: [] }); setImageInput(''); setShowProductModal(true) }

  const openEditProduct = (p) => { setEditingProduct(p); setForm({ title: p.title, description: p.description, category: p.category || 'alisado', price: String(p.price), offerPrice: p.offerPrice ? String(p.offerPrice) : '', stock: String(p.stock), images: [...p.images] }); setImageInput(''); setShowProductModal(true) }

  const addImage = () => { if (imageInput.trim() && !form.images.includes(imageInput.trim())) { setForm({ ...form, images: [...form.images, imageInput.trim()] }); setImageInput('') } }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingImage(true)
    let loaded = 0
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target.result
        setForm(prev => ({ ...prev, images: [...prev.images, dataUrl] }))
        loaded++
        if (loaded === files.length) setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx) => { setForm({ ...form, images: form.images.filter((_, i) => i !== idx) }) }

  const handleSave = async () => {
    if (!form.title || !form.description || !form.price) return
    setSaving(true)
    try {
      const body = { ...form, category: form.category || 'alisado', price: Number(form.price), offerPrice: form.offerPrice ? Number(form.offerPrice) : null, stock: Number(form.stock) }
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })
        showToast('Producto actualizado')
      } else {
        await fetch('/api/products', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
        showToast('Producto creado')
      }
      setShowProductModal(false); fetchProducts()
    } catch { showToast('Error al guardar') }
    setSaving(false)
  }

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try { await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() }); fetchProducts(); showToast('Producto eliminado') } catch {}
  }

  const openNewCoupon = () => { setEditingCoupon(null); setCouponForm({ code: '', type: 'percentage', value: '', minTotal: '0', maxUses: '', expiresAt: '' }); setShowCouponModal(true) }

  const openEditCoupon = (c) => { setEditingCoupon(c); setCouponForm({ code: c.code, type: c.type, value: String(c.value), minTotal: String(c.minTotal), maxUses: c.maxUses ? String(c.maxUses) : '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' }); setShowCouponModal(true) }

  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.value) return
    setSaving(true)
    try {
      const body = { ...couponForm, value: Number(couponForm.value), minTotal: Number(couponForm.minTotal), maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null, expiresAt: couponForm.expiresAt || null }
      if (editingCoupon) {
        await fetch(`/api/admin/coupons/${editingCoupon.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })
        showToast('Cupón actualizado')
      } else {
        await fetch('/api/admin/coupons', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
        showToast('Cupón creado')
      }
      setShowCouponModal(false); fetchCoupons()
    } catch { showToast('Error al guardar cupón') }
    setSaving(false)
  }

  const toggleCouponActive = async (c) => {
    try { await fetch(`/api/admin/coupons/${c.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isActive: !c.isActive }) }); fetchCoupons() } catch {}
  }

  const deleteCoupon = async (id) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try { await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: authHeaders() }); fetchCoupons(); showToast('Cupón eliminado') } catch {}
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const totalRevenue = orders.reduce((s, o) => s + (['Pagada', 'Entregado', 'En tránsito', 'En preparación', 'Confirmado'].includes(o.status) ? o.total : 0), 0)

  const ventasPaid = orders.filter(o => o.status !== 'Rechazado' && o.status !== 'Pendiente')
  const ventasSorted = useMemo(() => {
    let list = [...ventasPaid]
    if (ventasFilter.status !== 'all') list = list.filter(o => o.status === ventasFilter.status)
    if (ventasFilter.payment !== 'all') list = list.filter(o => o.paymentMethod === ventasFilter.payment)
    list.sort((a, b) => {
      const dir = ventasFilter.order === 'desc' ? -1 : 1
      if (ventasFilter.sort === 'total') return dir * ((a.total || 0) - (b.total || 0))
      return dir * (new Date(a.createdAt) - new Date(b.createdAt))
    })
    return list
  }, [ventasPaid, ventasFilter])

  const newSalesCount = orders.filter(o => !viewedSales.includes(o.id) && o.status !== 'Pendiente').length
  const todaySales = orders.filter(o => {
    if (!o.createdAt) return false
    const today = new Date(); const d = new Date(o.createdAt)
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })
  const ventasStats = [
    { label: 'Total Ventas', value: ventasPaid.length, icon: ShoppingBag, color: '#0F2038' },
    { label: 'Ingresos Totales', value: clp(ventasPaid.reduce((s, o) => s + o.total, 0)), icon: DollarSign, color: '#755841' },
    { label: 'Ventas Hoy', value: todaySales.length, icon: CheckCircle, color: '#755841' },
    { label: 'Nuevas', value: newSalesCount, icon: Eye, color: '#755841' },
  ]

  if (checking) return null

  const orderStats = [
    { label: 'Total Ingresos', value: clp(totalRevenue), icon: DollarSign, color: '#0F2038' },
    { label: 'Pendientes', value: orders.filter(o => o.status === 'Pendiente').length, icon: Package, color: '#755841' },
    { label: 'En tránsito', value: orders.filter(o => o.status === 'En tránsito').length, icon: Truck, color: '#755841' },
    { label: 'Entregados', value: orders.filter(o => o.status === 'Entregado').length, icon: CheckCircle, color: '#755841' },
  ]

  const productStats = [
    { label: 'Total Productos', value: products.length, icon: Package, color: '#0F2038' },
    { label: 'Stock Total', value: products.reduce((s, p) => s + p.stock, 0), icon: Package, color: '#755841' },
    { label: 'Sin Stock', value: products.filter(p => p.stock === 0).length, icon: Truck, color: '#755841' },
    { label: 'En Oferta', value: products.filter(p => p.offerPrice).length, icon: DollarSign, color: '#755841' },
  ]

  const couponStats = [
    { label: 'Total Cupones', value: coupons.length, icon: Percent, color: '#0F2038' },
    { label: 'Activos', value: coupons.filter(c => c.isActive).length, icon: CheckCircle, color: '#755841' },
    { label: 'Usados', value: coupons.reduce((s, c) => s + c.usedCount, 0), icon: Copy, color: '#755841' },
    { label: 'Próximos a vencer', value: coupons.filter(c => c.isActive && c.expiresAt).length, icon: Calendar, color: '#755841' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-navy text-cream px-5 py-3 rounded-lg text-sm shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <motion.div className="flex justify-between items-center mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div>
            <span className="label text-xs text-gold">Admin</span>
            <LetterReveal text="Dashboard" className="h-lg text-3xl text-navy mt-2 block" />
          </div>
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-ghost text-xs underline underline-offset-4">
            Cerrar Sesión
          </motion.button>
        </motion.div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 flex-nowrap">
          {['ventas', 'orders', 'products', 'coupons', 'reviews', 'messages'].map((t, i) => (
            <motion.button key={t} onClick={() => setTab(t)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
               className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                tab === t ? 'bg-navy text-cream shadow-md glow-navy' : 'text-stone hover:text-navy hover:bg-navy/5'
              }`}>
               {t === 'ventas' ? 'Ventas' : t === 'orders' ? 'Pedidos' : t === 'products' ? 'Productos' : t === 'coupons' ? 'Cupones' : t === 'reviews' ? 'Reseñas' : 'Mensajes'}
              {t === 'ventas' && newSalesCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {newSalesCount > 9 ? '9+' : newSalesCount}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'ventas' ? (
            <motion.div key="ventas" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" variants={containerVariants} initial="hidden" animate="visible">
                {ventasStats.map((s) => (
                  <motion.div key={s.label} variants={itemVariants}
                    className="glass-card p-5 rounded text-center">
                    <s.icon size={18} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: s.color }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="display-sm" style={{ color: s.color }}>{s.value}</motion.p>
                    <p className="text-xs mt-1 text-stone">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex flex-wrap gap-2 mb-6 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <select value={ventasFilter.status} onChange={e => setVentasFilter({ ...ventasFilter, status: e.target.value })}
                    className="input-minimal text-xs px-3 py-2 rounded-lg w-auto">
                    <option value="all">Todos los estados</option>
                    {['Pagada', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select value={ventasFilter.payment} onChange={e => setVentasFilter({ ...ventasFilter, payment: e.target.value })}
                    className="input-minimal text-xs px-3 py-2 rounded-lg w-auto">
                    <option value="all">Todos los pagos</option>
                    <option value="webpay">Webpay</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
                <div className="flex gap-1">
                  {['date', 'total'].map(s => (
                    <motion.button key={s} onClick={() => setVentasFilter(f => ({ ...f, sort: s }))}
                      whileTap={{ scale: 0.95 }}
                      className={`text-xs px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                        ventasFilter.sort === s ? 'bg-navy text-cream' : 'text-stone hover:text-navy hover:bg-navy/5'
                      }`}>
                      <ArrowUpDown size={12} />
                      {s === 'date' ? 'Fecha' : 'Total'}
                    </motion.button>
                  ))}
                  <motion.button onClick={() => setVentasFilter(f => ({ ...f, order: f.order === 'desc' ? 'asc' : 'desc' }))}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs px-3 py-2 rounded-lg text-stone hover:text-navy hover:bg-navy/5 transition-all duration-200">
                    {ventasFilter.order === 'desc' ? '↓' : '↑'}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3">
                {ventasSorted.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag size={32} className="mx-auto mb-3 text-outline-v" />
                    <p className="text-stone text-sm">Aún no hay ventas</p>
                  </div>
                ) : (
                  ventasSorted.map((o, idx) => {
                    const isNew = !viewedSales.includes(o.id)
                    return (
                      <motion.div key={o.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                        onClick={() => { setSelected(o); markViewed(o.id) }}
                        className={`glass p-5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                          isNew ? 'border-l-gold bg-white' : 'border-l-transparent'
                        }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isNew && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                              )}
                              <span className="font-mono font-bold text-navy text-sm">{o.orderNumber}</span>
                              <span className={`pill text-[10px] ${
                                o.status === 'Pagada' ? 'bg-green-50 text-green-700' :
                                o.status === 'Entregado' ? 'bg-blue-50 text-blue-700' :
                                o.status === 'En tránsito' ? 'bg-amber-50 text-amber-700' :
                                'bg-navy/5 text-navy'
                              }`}>{o.status}</span>
                              <span className="text-[10px] text-outline-v flex items-center gap-1">
                                <CreditCard size={10} /> {o.paymentMethod === 'webpay' ? 'Webpay' : 'MP'}
                              </span>
                            </div>
                            <p className="text-sm text-stone truncate">{o.customerName}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-outline-v">
                              <span>{o.createdAt ? new Date(o.createdAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                              <span>{o.items?.length || 0} producto(s)</span>
                              {o.discount > 0 && <span className="text-green-600">-{clp(o.discount)}</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-navy font-bold text-lg">{clp(o.total)}</p>
                            <motion.span whileHover={{ x: 4 }}
                              className="text-[11px] text-gold flex items-center gap-1 justify-end mt-1 lg:opacity-0 lg:group-hover:opacity-100">
                              Ver detalle <ChevronDown size={10} />
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          ) : tab === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" variants={containerVariants} initial="hidden" animate="visible">
                {orderStats.map((s) => (
                  <motion.div key={s.label} variants={itemVariants}
                    className="glass-card p-5 rounded text-center">
                    <s.icon size={18} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: s.color }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="display-sm" style={{ color: s.color }}>{s.value}</motion.p>
                    <p className="text-xs mt-1 text-stone">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado', 'Rechazado'].map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                      filter === s ? 'bg-navy text-cream shadow-sm' : 'text-stone hover:text-navy hover:bg-navy/5'
                    }`}>
                    {s === 'all' ? 'Todos' : s}
                  </button>
                ))}
              </div>

              <div className="glass rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-v/20">
                        {['Pedido', 'Cliente', 'Total', 'Estado', 'Fecha', ''].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="p-6">
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </td></tr>
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16"><p className="text-stone text-sm">Sin pedidos aún</p></td></tr>
                      ) : (
                        filtered.map((o, idx) => (
                          <motion.tr key={o.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                            className="border-b border-outline-v/10 hover:bg-white/50 transition-colors cursor-pointer group"
                            onClick={() => setSelected(o)}>
                            <td className="px-4 py-3.5 font-medium text-navy">{o.orderNumber}</td>
                            <td className="px-4 py-3.5 text-stone">{o.customerName || '—'}</td>
                            <td className="px-4 py-3.5 text-navy font-medium">{clp(o.total)}</td>
                            <td className="px-4 py-3.5">
                              <span className="pill text-[11px]" style={{ backgroundColor: 'rgba(15,32,56,0.08)', color: '#0F2038' }}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-outline-v">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CL') : '—'}
                            </td>
                            <td className="px-4 py-3.5">
                              <motion.select value={o.status}
                                onChange={e => { e.stopPropagation(); updateStatus(o.id, e.target.value) }}
                                whileFocus={{ scale: 1.02 }}
                                className="text-xs border border-outline-v/20 rounded-lg px-2.5 py-1.5 bg-white/60 text-navy focus:bg-white focus:border-navy focus:outline-none transition-all duration-200">
                                {['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado', 'Rechazado'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </motion.select>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : tab === 'products' ? (
            <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" variants={containerVariants} initial="hidden" animate="visible">
                {productStats.map((s) => (
                  <motion.div key={s.label} variants={itemVariants}
                    className="glass-card p-5 rounded text-center">
                    <s.icon size={18} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: s.color }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="display-sm" style={{ color: s.color }}>{s.value}</motion.p>
                    <p className="text-xs mt-1 text-stone">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex justify-end mb-6">
                <motion.button onClick={openNewProduct} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary text-sm flex items-center gap-2 px-5 py-2.5">
                  <Plus size={16} /> Nuevo Producto
                </motion.button>
              </div>

              <div className="glass rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-v/20">
                        {['', 'Producto', 'Categoría', 'Precio', 'Oferta', 'Stock', 'Acciones'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingProducts ? (
                        <tr><td colSpan={7} className="p-6">
                          <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </td></tr>
                      ) : products.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-16">
                          <Package size={32} className="mx-auto mb-3 text-outline-v" />
                          <p className="text-stone text-sm">Sin productos. Crea el primero.</p>
                        </td></tr>
                      ) : (
                        products.map((p, idx) => (
                          <motion.tr key={p.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                            className="border-b border-outline-v/10 hover:bg-white/50 transition-colors group">
                            <td className="px-4 py-3">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center"><Package size={14} className="text-outline-v" /></div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">{p.title}</td>
                            <td className="px-4 py-3"><span className="text-[11px] px-2 py-0.5 rounded-full bg-navy/5 text-navy">{p.category || 'alisado'}</span></td>
                            <td className="px-4 py-3 text-navy">{clp(p.price)}</td>
                            <td className="px-4 py-3">
                              {p.offerPrice ? (
                                <span className="text-gold font-medium">{clp(p.offerPrice)}</span>
                              ) : <span className="text-outline-v">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`pill ${
                                p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 5 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                              }`}>{p.stock}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                                <motion.button onClick={() => openEditProduct(p)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors">
                                  <Pencil size={14} className="text-stone" />
                                </motion.button>
                                <motion.button onClick={() => deleteProduct(p.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} className="text-red-400" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : tab === 'coupons' ? (
            <motion.div key="coupons" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" variants={containerVariants} initial="hidden" animate="visible">
                {couponStats.map((s) => (
                  <motion.div key={s.label} variants={itemVariants}
                    className="glass-card p-5 rounded text-center">
                    <s.icon size={18} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: s.color }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="display-sm" style={{ color: s.color }}>{s.value}</motion.p>
                    <p className="text-xs mt-1 text-stone">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex justify-end mb-6">
                <motion.button onClick={openNewCoupon} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary text-sm flex items-center gap-2 px-5 py-2.5">
                  <Plus size={16} /> Nuevo Cupón
                </motion.button>
              </div>

              <div className="glass rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-v/20">
                        {['Código', 'Tipo', 'Valor', 'Mínimo', 'Usos', 'Vence', 'Estado', 'Acciones'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingCoupons ? (
                        <tr><td colSpan={8} className="p-6">
                          <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </td></tr>
                      ) : coupons.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-16">
                          <Percent size={32} className="mx-auto mb-3 text-outline-v" />
                          <p className="text-stone text-sm">Sin cupones. Crea el primero.</p>
                        </td></tr>
                      ) : (
                        coupons.map((c, idx) => (
                          <motion.tr key={c.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                            className="border-b border-outline-v/10 hover:bg-white/50 transition-colors group">
                            <td className="px-4 py-3 font-mono font-bold text-navy">{c.code}</td>
                            <td className="px-4 py-3 text-stone text-xs">{c.type === 'percentage' ? '%' : '$'}</td>
                            <td className="px-4 py-3 text-navy font-medium">{c.type === 'percentage' ? `${c.value}%` : clp(c.value)}</td>
                            <td className="px-4 py-3 text-outline-v text-xs">{c.minTotal ? clp(c.minTotal) : '—'}</td>
                            <td className="px-4 py-3 text-xs text-stone">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                            <td className="px-4 py-3 text-xs text-outline-v">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-CL') : '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`pill text-[11px] ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {c.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                                <motion.button onClick={() => toggleCouponActive(c)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors">
                                  <Power size={14} className={c.isActive ? 'text-green-500' : 'text-outline-v'} />
                                </motion.button>
                                <motion.button onClick={() => openEditCoupon(c)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors">
                                  <Pencil size={14} className="text-stone" />
                                </motion.button>
                                <motion.button onClick={() => deleteCoupon(c.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} className="text-red-400" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : tab === 'messages' ? (
            <motion.div key="messages" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="label text-xs text-stone mb-1">Administrar</p>
                  <p className="h-md text-navy text-xl">Mensajes de Contacto</p>
                </div>
                <MessageSquare size={20} className="text-outline-v" />
              </div>
              <div className="glass rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-v/20">
                        {['Nombre', 'Email', 'Asunto', 'Mensaje', 'Fecha', 'Estado'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingMessages ? (
                        <tr><td colSpan={6} className="p-6">
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </td></tr>
                      ) : messages.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16">
                          <MessageSquare size={32} className="mx-auto mb-3 text-outline-v" />
                          <p className="text-stone text-sm">Sin mensajes aún</p>
                        </td></tr>
                      ) : (
                        messages.map((m, idx) => (
                          <motion.tr key={m.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                            onClick={() => !m.read && markRead(m.id)}
                            className={`border-b border-outline-v/10 hover:bg-white/50 transition-colors cursor-pointer ${!m.read ? 'bg-amber-50/30 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-navy">{m.name}</td>
                            <td className="px-4 py-3 text-stone"><a href={`mailto:${m.email}`} className="hover:text-gold transition-colors">{m.email}</a></td>
                            <td className="px-4 py-3 text-stone">{m.subject || '—'}</td>
                            <td className="px-4 py-3 text-stone max-w-[250px] truncate">{m.message}</td>
                            <td className="px-4 py-3 text-xs text-outline-v">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`pill text-[11px] ${m.read ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                {m.read ? 'Leído' : 'Nuevo'}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="reviews" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="label text-xs text-stone mb-1">Administrar</p>
                  <p className="h-md text-navy text-xl">Reseñas</p>
                </div>
                <MessageSquare size={20} className="text-outline-v" />
              </div>
              <div className="glass rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-v/20">
                        {['Cliente', 'Rating', 'Comentario', 'Fecha', 'Estado', 'Acciones'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingReviews ? (
                        <tr><td colSpan={6} className="p-6">
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </td></tr>
                      ) : reviews.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16">
                          <MessageSquare size={32} className="mx-auto mb-3 text-outline-v" />
                          <p className="text-stone text-sm">Sin reseñas aún</p>
                        </td></tr>
                      ) : (
                        reviews.map((r, idx) => (
                          <motion.tr key={r.id} custom={idx} variants={rowVariants} initial="hidden" animate="visible"
                            className="border-b border-outline-v/10 hover:bg-white/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-navy">{r.customerName}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < r.rating ? '#755841' : '#d4cfcc'}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                  </svg>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone max-w-[250px] truncate">{r.comment}</td>
                            <td className="px-4 py-3 text-xs text-outline-v">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`pill text-[11px] ${r.isApproved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                {r.isApproved ? 'Aprobada' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                {!r.isApproved && (
                                  <motion.button onClick={() => approveReview(r.id, true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Aprobar">
                                    <ThumbsUp size={14} className="text-green-500" />
                                  </motion.button>
                                )}
                                {r.isApproved && (
                                  <motion.button onClick={() => approveReview(r.id, false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="Rechazar">
                                    <X size={14} className="text-amber-500" />
                                  </motion.button>
                                )}
                                <motion.button onClick={() => deleteReview(r.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                                  <Trash2 size={14} className="text-red-400" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass p-6 md:p-8 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-modal" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="label text-xs text-stone mb-1">Pedido</p>
                  <p className="h-md text-navy text-xl">{selected.orderNumber}</p>
                </div>
                <motion.button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors" whileHover={{ rotate: 90 }}>
                  <X size={16} className="text-stone" />
                </motion.button>
              </div>
              <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants} className="glass-card-alt p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Cliente</h4>
                  <p className="text-sm text-stone">{selected.customerName}</p>
                            <p className="text-sm text-stone">{(selected.customerEmail || '—')} · {(selected.customerPhone || '—')}</p>
                  <p className="text-sm text-stone mt-1">{selected.shippingAddress}, {selected.shippingCity}, {selected.shippingRegion}</p>
                </motion.div>
                <motion.div variants={itemVariants} className="glass-card-alt p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Productos</h4>
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-stone">{item.title} × {item.quantity}</span>
                      <span className="text-navy font-medium">{clp(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {selected.discount > 0 && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-green-600">Descuento ({selected.couponCode})</span>
                      <span className="text-green-600 font-medium">-{clp(selected.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-outline-v/20 mt-2 pt-2 flex justify-between font-medium">
                    <span className="text-navy">Total</span>
                    <span className="text-navy">{clp(selected.total)}</span>
                    <span className="text-xs text-outline-v ml-2">({selected.paymentMethod})</span>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="glass-card-alt p-4 rounded">
                  <h4 className="h-sm text-navy text-sm mb-2">Estado</h4>
                  <select value={selected.status}
                    onChange={e => { updateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }) }}
                    className="input-minimal w-full">
                    {['Pendiente', 'Confirmado', 'En preparación', 'En tránsito', 'Entregado', 'Rechazado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowProductModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass p-6 md:p-8 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-modal" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="label text-xs text-stone mb-1">Producto</p>
                  <p className="h-md text-navy text-xl">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</p>
                </div>
                <motion.button onClick={() => setShowProductModal(false)} className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors" whileHover={{ rotate: 90 }}>
                  <X size={16} className="text-stone" />
                </motion.button>
              </div>
              <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Tag size={12} className="inline mr-1" />Título</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="input-minimal w-full" placeholder="Ej: Serum Revitalizante" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><AlignLeft size={12} className="inline mr-1" />Descripción</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="input-minimal w-full" placeholder="Descripción del producto..." />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Tag size={12} className="inline mr-1" />Categoría</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-minimal w-full">
                    <option value="alisado">Alisado</option>
                    <option value="cuidado">Cuidado Capilar</option>
                    <option value="barba">Barba</option>
                    <option value="rostro">Rostro</option>
                  </select>
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label"><Hash size={12} className="inline mr-1" />Precio (ej. 20 = $20.000)</label>
                    <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="input-minimal w-full" placeholder="20" />
                  </div>
                  <div>
                    <label className="input-label"><Percent size={12} className="inline mr-1" />Precio Oferta</label>
                    <input type="number" min="0" value={form.offerPrice} onChange={e => setForm({ ...form, offerPrice: e.target.value })}
                      className="input-minimal w-full" placeholder="14" />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Package size={12} className="inline mr-1" />Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="input-minimal w-full" placeholder="0" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><ImagePlus size={12} className="inline mr-1" />Imágenes</label>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple
                    onChange={handleImageUpload} className="hidden" />
                  <div className="flex gap-2 mb-3">
                    <motion.button onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="btn-secondary text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap">
                      <ImagePlus size={16} /> {uploadingImage ? 'Subiendo...' : 'Subir imágenes'}
                    </motion.button>
                  </div>
                  {form.images.length > 0 && (
                    <motion.div className="flex flex-wrap gap-2" variants={containerVariants} initial="hidden" animate="visible">
                      {form.images.map((url, idx) => (
                        <motion.div key={idx} custom={idx} variants={itemVariants} className="relative group">
                          <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-outline-v/10 shadow-sm"
                            onError={e => { e.target.style.display = 'none' }} />
                          <motion.button onClick={() => removeImage(idx)}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-sm">
                            <X size={10} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
                <motion.div variants={itemVariants} className="flex justify-end gap-3 pt-5 border-t border-outline-v/10">
                  <motion.button onClick={() => setShowProductModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-ghost text-sm px-5 py-2.5">Cancelar</motion.button>
                  <motion.button onClick={handleSave} disabled={saving || !form.title || !form.description || !form.price}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Producto'}
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCouponModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowCouponModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass p-6 md:p-8 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-modal" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="label text-xs text-stone mb-1">Cupón</p>
                  <p className="h-md text-navy text-xl">{editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}</p>
                </div>
                <motion.button onClick={() => setShowCouponModal(false)} className="p-1.5 rounded-lg hover:bg-navy/10 transition-colors" whileHover={{ rotate: 90 }}>
                  <X size={16} className="text-stone" />
                </motion.button>
              </div>
              <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Tag size={12} className="inline mr-1" />Código</label>
                  <input value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="input-minimal w-full uppercase" placeholder="DESCUENTO10" disabled={!!editingCoupon} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Percent size={12} className="inline mr-1" />Tipo</label>
                  <div className="flex gap-2">
                    {['percentage', 'fixed'].map(t => (
                      <motion.button key={t} onClick={() => setCouponForm({ ...couponForm, type: t })}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          couponForm.type === t ? 'bg-navy text-cream shadow-sm' : 'bg-navy/5 text-stone hover:bg-navy/10'
                        }`}>
                        {t === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Hash size={12} className="inline mr-1" />{couponForm.type === 'percentage' ? 'Porcentaje de descuento' : 'Monto de descuento ($)'}</label>
                  <input type="number" value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: e.target.value })}
                    className="input-minimal w-full" placeholder={couponForm.type === 'percentage' ? '15' : '5000'} />
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label"><DollarSign size={12} className="inline mr-1" />Compra mínima ($)</label>
                    <input type="number" value={couponForm.minTotal} onChange={e => setCouponForm({ ...couponForm, minTotal: e.target.value })}
                      className="input-minimal w-full" placeholder="0" />
                  </div>
                  <div>
                    <label className="input-label"><Copy size={12} className="inline mr-1" />Usos máximos</label>
                    <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                      className="input-minimal w-full" placeholder="Sin límite" />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="input-label"><Calendar size={12} className="inline mr-1" />Vence (opcional)</label>
                  <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    className="input-minimal w-full" />
                </motion.div>
                <motion.div variants={itemVariants} className="flex justify-end gap-3 pt-5 border-t border-outline-v/10">
                  <motion.button onClick={() => setShowCouponModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-ghost text-sm px-5 py-2.5">Cancelar</motion.button>
                  <motion.button onClick={handleSaveCoupon} disabled={saving || !couponForm.code || !couponForm.value}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Guardando...' : editingCoupon ? 'Actualizar' : 'Crear Cupón'}
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
