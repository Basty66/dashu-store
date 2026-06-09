import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingBag, MapPin, CreditCard, ChevronRight, AlertCircle, Truck } from 'lucide-react'
import { clp } from '../lib/format'

const CHILE_REGIONS = {
  'Metropolitana de Santiago': ['Santiago Centro', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida', 'Puente Alto', 'San Miguel', 'Vitacura', 'Peñalolén', 'Huechuraba', 'Renca', 'Quilicura', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Independencia', 'La Cisterna', 'La Granja', 'La Pintana', 'La Reina', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Pedro Aguirre Cerda', 'Pirque', 'Pudahuel', 'Quinta Normal', 'Recoleta', 'San Bernardo', 'San Joaquín', 'San Ramón', 'Talagante', 'Buin', 'Colina', 'Curacaví', 'El Monte', 'Isla de Maipo', 'Lampa', 'María Pinto', 'Melipilla', 'Padre Hurtado', 'Peñaflor', 'San José de Maipo', 'Til Til'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes', 'La Calera', 'Quillota', 'Limache', 'Olmué', 'Algarrobo', 'Cartagena', 'Casablanca', 'Catemu', 'El Quisco', 'El Tabo', 'Hijuelas', 'La Cruz', 'Llay Llay', 'Los Andes', 'Nogales', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Putaendo', 'Rinconada', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Viña del Mar', 'Zapallar'],
  'Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel', 'Hualpén', 'Chiguayante', 'San Pedro de la Paz', 'Lota', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Florida', 'Hualqui', 'Lebu', 'Los Álamos', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Tirúa', 'Tomé', 'Yumbel'],
  'O\'Higgins': ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Graneros', 'Mostazal', 'Codegua', 'Doñihue', 'Coltauco', 'Coínco', 'Pichidegua', 'Las Cabras', 'Peumo', 'San Vicente', 'Requínoa', 'Olivar', 'Quinta de Tilcoco', 'Nancagua', 'Chimbarongo', 'Palmilla', 'Peralillo', 'Navidad', 'Lolol', 'Santa Cruz', 'Pumanque', 'Placilla', 'Marchihue', 'Pichilemu', 'Litueche', 'La Estrella'],
  'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica', 'Pisagua'],
  'Antofagasta': ['Antofagasta', 'Calama', 'San Pedro de Atacama', 'Mejillones', 'Taltal', 'Tocopilla', 'María Elena', 'Ollagüe'],
  'Atacama': ['Copiapó', 'Vallenar', 'Huasco', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Freirina', 'Tierra Amarilla'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Los Vilos', 'Salamanca', 'Andacollo', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado', 'Canela'],
  'Maule': ['Talca', 'Curicó', 'Linares', 'Constitución', 'San Javier', 'Cauquenes', 'Molina', 'Parral', 'San Clemente', 'Teno', 'Romeral', 'Rauco', 'Sagrada Familia', 'Hualañé', 'Licantén', 'Vichuquén', 'Colbún', 'San Rafael', 'Chanco', 'Pelluhue', 'Empedrado', 'Maule', 'Pelarco', 'Río Claro'],
  'Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Quillón', 'Bulnes', 'Cobquecura', 'Coelemu', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quirihue', 'Ránguil', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol', 'Lautaro', 'Nueva Imperial', 'Victoria', 'Collipulli', 'Curacautín', 'Gorbea', 'Loncoche', 'Pitrufquén', 'Carahue', 'Freire', 'Cunco', 'Cholchol', 'Perquenco', 'Galvarino', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Ercilla', 'Los Sauces', 'Purén', 'Traiguén', 'Lumaco', 'Renaico'],
  'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Paillaco', 'Futrono', 'Lanco', 'Máfil', 'Los Lagos', 'Corral', 'Mariquina', 'Panguipulli'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Llanquihue', 'Puerto Varas', 'Calbuco', 'Frutillar', 'Fresia', 'Los Muermos', 'Maullín', 'Chonchi', 'Quellón', 'Quemchi', 'Dalcahue', 'Curaco de Vélez', 'Hualaihué', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo'],
  'Aysén': ['Coyhaique', 'Puerto Aysén', 'Puerto Cisnes', 'Chile Chico', 'Cochrane', 'Río Ibáñez', 'Tortel', 'Guaitecas', 'O\'Higgins', 'Lago Verde'],
  'Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams', 'Cabo de Hornos', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine', 'Primavera'],
}

const SHIPPING_COST = {
  'Metropolitana de Santiago': 3,
  'Valparaíso': 3,
  "O'Higgins": 3,
  'Maule': 4,
  'Ñuble': 4,
  'Biobío': 4,
  'Coquimbo': 5,
  'Atacama': 5,
  'La Araucanía': 5,
  'Los Ríos': 5,
  'Antofagasta': 6,
  'Los Lagos': 6,
  'Arica y Parinacota': 7,
  'Tarapacá': 7,
  'Aysén': 8,
  'Magallanes': 10,
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', phone: '', region: '', city: '', address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState('webpay')
  const [error, setError] = useState(searchParams.get('error') || '')
  const [step, setStep] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const regions = Object.keys(CHILE_REGIONS)
  const cities = form.region ? CHILE_REGIONS[form.region] : []
  const discount = coupon?.valid ? coupon.discount : 0
  const shipping = form.region ? (SHIPPING_COST[form.region] || 4) : 0
  const total = subtotal + shipping - discount

  const steps = [
    { icon: ShoppingBag, label: 'Carrito', done: items.length > 0 },
    { icon: MapPin, label: 'Envío', done: form.name && form.email && form.region && form.city && form.address },
    { icon: CreditCard, label: 'Pago', done: false },
  ]

  const handlePayment = async () => {
    if (!form.name || !form.email || !form.region || !form.city || !form.address) {
      setError('Completa todos los campos obligatorios')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('El email ingresado no es válido')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        items: items.map(i => ({ id: i.id, title: i.name, quantity: i.quantity, price: i.price })),
        customer: {
          name: form.name, email: form.email, phone: form.phone,
          region: form.region, city: form.city, address: form.address, notes: form.notes,
        },
        shipping: shipping,
        couponCode: coupon?.code || null,
        discount: discount,
      }
      const endpoint = payment === 'webpay' ? '/api/checkout/webpay' : '/api/checkout/mercadopago'
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) {
        if (data.details) {
          throw new Error(data.details.map(d => d.error).join('\n'))
        }
        throw new Error(data.error || 'Error al procesar')
      }
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const r = await fetch('/api/checkout/validate-coupon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal + (form.region ? (SHIPPING_COST[form.region] || 4) : 0) }),
      })
      const data = await r.json()
      if (data.valid) {
        setCoupon(data)
      } else {
        setCouponError(data.error || 'Cupón inválido')
        setCoupon(null)
      }
    } catch {
      setCouponError('Error al validar cupón')
    }
    setCouponLoading(false)
  }

  const removeCoupon = () => { setCoupon(null); setCouponCode(''); setCouponError('') }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label text-xs text-gold">Checkout</span>
          <h1 className="display-md text-navy mt-2">Finalizar Compra</h1>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    step === i ? 'bg-navy text-cream shadow-md' : 'text-stone'
                  }`}>
                  <s.icon size={14} />
                  <span className="hidden sm:inline text-xs font-medium">{s.label}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <ChevronRight size={14} className="mx-2 text-outline-v" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="glass p-4 rounded-lg text-sm text-red-700 border border-red-200 bg-red-50/50 overflow-hidden">
                  {error.split('\n').map((line, i) => (
                    <p key={i} className="flex items-center gap-2"><AlertCircle size={14} className="flex-shrink-0" />{line}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemVariants} className="glass p-6 md:p-8 rounded-xl">
                <h2 className="h-md text-navy mb-6 flex items-center gap-2">
                  <MapPin size={16} className="text-gold" /> Información de Envío
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="input-label">Nombre completo</label>
                    <input className="input-minimal w-full" placeholder="Ej: Juan Pérez"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input type="email" className="input-minimal w-full" placeholder="ejemplo@correo.cl"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Teléfono</label>
                    <input type="tel" className="input-minimal w-full" placeholder="+56 9 XXXX XXXX"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Región</label>
                    <select className="input-minimal w-full" value={form.region}
                      onChange={e => setForm({ ...form, region: e.target.value, city: '' })}>
                      <option value="">Seleccionar</option>
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Comuna</label>
                    <select className="input-minimal w-full" value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })} disabled={!cities.length}>
                      <option value="">Seleccionar</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label">Dirección</label>
                    <input className="input-minimal w-full" placeholder="Calle, número, depto"
                      value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label">Notas del pedido</label>
                    <input className="input-minimal w-full" placeholder="Opcional — ej: dejar en conserjería"
                      value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass p-6 md:p-8 rounded-xl">
                <h2 className="h-md text-navy mb-6 flex items-center gap-2">
                  <CreditCard size={16} className="text-gold" /> Método de Pago
                </h2>
                <div className="flex rounded-xl bg-white/60 p-1.5 border border-outline-v/15 max-w-sm">
                  {['webpay', 'mercadopago'].map(m => (
                    <button key={m} onClick={() => setPayment(m)}
                      className={`flex-1 min-h-[44px] py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                        payment === m ? 'bg-navy text-cream shadow-sm' : 'text-stone hover:text-navy'
                      }`}>
                      {m === 'webpay' ? 'Webpay Plus' : 'Mercado Pago'}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={payment} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="text-xs mt-3 text-outline-v">
                    {payment === 'webpay' ? 'Débito / Crédito / Prepago' : 'Pago con Mercado Pago'}
                  </motion.p>
                </AnimatePresence>
              </motion.div>

              <motion.button className="btn-primary w-full justify-center text-base" onClick={handlePayment}
                disabled={loading || items.length === 0}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Procesando...</motion.span>
                ) : (
                  <>Pagar {clp(total)}</>
                )}
              </motion.button>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass p-6 rounded-xl sticky top-24 space-y-5 shadow-card">
              <h2 className="h-md text-navy flex items-center gap-2">
                <ShoppingBag size={16} className="text-gold" /> Resumen
              </h2>
              {items.length === 0 ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-stone">Tu carrito está vacío</motion.p>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {items.map(item => (
                    <motion.div key={item.id} variants={itemVariants} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center flex-shrink-0 border border-outline-v/10">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-xs text-outline-v">{item.quantity}x</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy">{item.name}</p>
                        <p className="text-xs text-stone">Cant: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-navy whitespace-nowrap">
                        {clp(item.price * item.quantity)}
                      </p>
                    </motion.div>
                  ))}
                  <div className="border-t border-outline-v/20 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Subtotal</span>
                      <span className="text-navy font-medium">{clp(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone flex items-center gap-1">
                        <Truck size={12} /> Envío
                      </span>
                      <span className="text-navy font-medium">{form.region ? clp(shipping) : '—'}</span>
                    </div>
                    <div className="border-t border-outline-v/10 pt-3">
                      <div className="flex gap-2">
                        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Cupón de descuento"
                          className="input-minimal flex-1 text-xs" disabled={!!coupon} />
                        {coupon ? (
                          <motion.button onClick={removeCoupon} whileTap={{ scale: 0.95 }}
                            className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap">
                            Quitar
                          </motion.button>
                        ) : (
                          <motion.button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                            whileTap={{ scale: 0.95 }}
                            className="text-xs px-3 py-2 rounded-lg bg-navy text-cream hover:bg-navy/90 transition-colors whitespace-nowrap disabled:opacity-50">
                            {couponLoading ? '...' : 'Aplicar'}
                          </motion.button>
                        )}
                      </div>
                      {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                      {coupon?.valid && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          Cupón {coupon.code} aplicado — {coupon.type === 'percentage' ? `${coupon.value}%` : `${clp(coupon.value)}`} de descuento
                        </motion.p>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Descuento</span>
                        <span className="text-green-600 font-medium">-{clp(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-3 border-t border-outline-v/20">
                      <span className="text-navy">Total</span>
                      <span className="text-navy text-lg">{clp(Math.max(total, 0))}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
