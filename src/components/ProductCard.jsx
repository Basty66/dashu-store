import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { clp } from '../lib/format'

export default function ProductCard({ product }) {
  const { addItem, stockAlert } = useCart()
  const maxed = stockAlert?.id === product.id

  return (
    <motion.div whileHover={{ y: -3 }}
      className="glass-card overflow-hidden group">
      <Link to={`/producto/${product.id}`}>
        <div className="aspect-[4/3] bg-cream/80 overflow-hidden relative">
          {product.images?.[0] ? (
            <motion.img src={product.images[0]} alt={product.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-outline-v text-xs">Sin imagen</div>
          )}
          {product.offerPrice && (
            <div className="absolute top-2 left-2 bg-gold text-cream text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Oferta
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Stock bajo
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Agotado
            </div>
          )}
        </div>
      </Link>
      <div className="p-5 space-y-2">
        <Link to={`/producto/${product.id}`}>
          <h3 className="h-sm text-navy text-sm leading-tight hover:text-gold transition-colors">{product.title}</h3>
        </Link>
        <p className="text-xs text-stone line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {product.offerPrice ? (
              <>
                <span className="h-md text-navy">{clp(product.offerPrice)}</span>
                <span className="text-xs text-outline-v line-through">{clp(product.price)}</span>
              </>
            ) : (
              <span className="h-md text-navy">{clp(product.price)}</span>
            )}
          </div>
          <motion.button onClick={e => {
            if (product.stock === 0) return
            const rect = e.currentTarget.getBoundingClientRect()
            addItem({ id: product.id, name: product.title, price: product.offerPrice || product.price, image: product.images?.[0], stock: product.stock }, rect)
          }}
            className={`p-3 rounded-full transition-colors ${product.stock === 0 ? 'bg-stone/20 text-stone cursor-not-allowed' : 'bg-navy text-cream hover:bg-gold'}`}
            whileHover={product.stock === 0 ? undefined : { scale: 1.1 }} whileTap={product.stock === 0 ? undefined : { scale: 0.9 }}>
            <ShoppingBag size={14} />
          </motion.button>
        </div>
        {maxed && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-red-600 font-medium">Stock máximo alcanzado</motion.p>
        )}
        {product.stock < 3 && product.stock > 0 && !maxed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[11px] text-amber-700 font-medium">Quedan {product.stock} unidades</motion.p>
        )}
      </div>
    </motion.div>
  )
}
