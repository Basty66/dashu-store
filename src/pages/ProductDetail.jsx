import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { clp } from '../lib/format'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem, stockAlert } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { if (data?.id) setProduct(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { setQty(1) }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-12 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-4xl font-black text-navy opacity-10">404</p>
          <p className="text-stone">Producto no encontrado</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 text-sm">Volver</Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : []
  const outOfStock = product.stock === 0

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-navy transition-colors mb-8">
          <ArrowLeft size={14} /> Volver a productos
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div className="relative glass rounded-2xl overflow-hidden aspect-square">
              {images.length > 0 ? (
                <>
                  <motion.img key={imgIdx} src={images[imgIdx]}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    alt={product.title} className="w-full h-full object-cover" />
                  {product.offerPrice && (
                    <div className="absolute top-4 left-4 bg-gold text-cream text-xs font-bold px-3 py-1 rounded-full">Oferta</div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-navy/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-white text-navy font-bold px-6 py-2 rounded-full text-sm">Agotado</span>
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <ChevronLeft size={16} className="text-navy" />
                      </button>
                      <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <ChevronRight size={16} className="text-navy" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline-v text-sm">Sin imagen</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === imgIdx ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:pt-8">
            {product.category && (
              <span className="pill text-[11px] px-3 py-1 rounded-full bg-navy/5 text-navy capitalize">{product.category}</span>
            )}
            <h1 className="display-sm text-navy leading-tight">{product.title}</h1>
            <div className="flex items-baseline gap-3">
              {product.offerPrice ? (
                <>
                  <span className="display-md text-navy">{clp(product.offerPrice)}</span>
                  <span className="text-lg text-outline-v line-through">{clp(product.price)}</span>
                </>
              ) : (
                <span className="display-md text-navy">{clp(product.price)}</span>
              )}
            </div>
            <p className="text-sm text-stone leading-relaxed">{product.description}</p>

            {!outOfStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-outline-v/20 bg-white overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-navy hover:bg-navy/5 transition-colors text-sm font-medium">−</button>
                  <span className="px-4 py-2.5 text-navy font-medium text-sm min-w-[40px] text-center border-x border-outline-v/10">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2.5 text-navy hover:bg-navy/5 transition-colors text-sm font-medium">+</button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs">
              {product.stock > 0 && product.stock < 10 ? (
                <span className="text-amber-700 font-medium">Solo {product.stock} unidades</span>
              ) : product.stock >= 10 ? (
                <span className="text-green-600 font-medium">Stock disponible</span>
              ) : (
                <span className="text-red-600 font-medium">Agotado</span>
              )}
            </div>

            <motion.button onClick={e => {
              if (outOfStock) return
              const rect = e.currentTarget.getBoundingClientRect()
              addItem({ id: product.id, name: product.title, price: product.offerPrice || product.price, image: product.images?.[0], stock: product.stock }, rect)
            }}
              disabled={outOfStock}
              className={`btn-primary w-full inline-flex items-center justify-center gap-2 ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={outOfStock ? undefined : { scale: 1.01 }} whileTap={outOfStock ? undefined : { scale: 0.99 }}>
              <ShoppingBag size={16} />
              {outOfStock ? 'Agotado' : `Agregar al Carrito · ${clp(product.offerPrice || product.price)}`}
            </motion.button>

            {stockAlert?.id === product.id && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 font-medium text-center">Stock máximo alcanzado en tu carro</motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
