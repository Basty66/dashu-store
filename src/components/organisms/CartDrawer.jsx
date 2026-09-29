import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X, ArrowRight, TrendingUp } from 'lucide-react'
import { formatCLP, nextPackUpsell, packLabel } from '@shared/pricing.js'
import { useCart, cartSubtotal, cartUnits } from '../../store/cart'
import { useProducts } from '../../hooks/useProducts'
import { Button } from '../atoms/Button'
import { CartLine } from '../molecules/CartLine'
import { EmptyState } from '../molecules/Feedback'
import { FreeShippingBar } from '../molecules/FreeShippingBar'

const ease = [0.16, 1, 0.3, 1]

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, switchPack } = useCart()
  const { data: products } = useProducts()
  const closeRef = useRef(null)
  const subtotal = cartSubtotal(items)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  const productOf = (id) => products?.find((p) => p.id === id)

  // Máximo de packs de una línea según el stock total del producto y lo que ya hay en otras líneas.
  function maxFor(line) {
    const product = productOf(line.productId)
    if (!product) return 99
    const otherUnits = items
      .filter((i) => i.productId === line.productId && i.packUnits !== line.packUnits)
      .reduce((n, i) => n + i.packUnits * i.quantity, 0)
    return Math.max(1, Math.floor((product.stock - otherUnits) / line.packUnits))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.45, ease }}
          >
            <header className="flex items-center justify-between border-b border-sand px-6 py-5">
              <h2 id="cart-title" className="font-display text-xl font-bold">
                Tu carrito {items.length > 0 && <span className="ml-1 font-mono text-sm font-normal text-muted">({cartUnits(items)} u.)</span>}
              </h2>
              <button ref={closeRef} type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label="Cerrar carrito">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Tu carrito está vacío"
                message="Elige un formato: mientras más grande el pack, menor el precio por unidad."
                action={<Button to="/#comprar" onClick={close} className="mt-2">Ver formatos</Button>}
                className="flex-1 justify-center"
              />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  <ul className="divide-y divide-sand">
                    {items.map((line) => {
                      const product = productOf(line.productId)
                      const upsell = product ? nextPackUpsell(line.packUnits, product.packs) : null
                      return (
                        <div key={`${line.productId}:${line.packUnits}`}>
                          <CartLine
                            line={line}
                            maxQuantity={maxFor(line)}
                            onQuantity={(q) => setQuantity(line.productId, line.packUnits, q)}
                            onRemove={() => remove(line.productId, line.packUnits)}
                          />
                          {upsell && line.quantity === 1 && upsell.pack.units <= (product?.stock ?? 0) && (
                            <button
                              type="button"
                              onClick={() => switchPack(line.productId, line.packUnits, upsell.pack)}
                              className="mb-4 flex w-full items-center gap-2 rounded-xl bg-gold/10 px-3 py-2.5 text-left text-xs text-ink transition-colors hover:bg-gold/20"
                            >
                              <TrendingUp size={14} className="flex-none text-gold-deep" aria-hidden="true" />
                              <span>
                                Cambia a <strong>{packLabel(upsell.pack.units)}</strong> y paga{' '}
                                <strong className="tabular">{formatCLP(upsell.savingPerUnit)}</strong> menos por unidad
                              </span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </ul>
                </div>
                <footer className="space-y-4 border-t border-sand bg-paper px-6 py-5">
                  <FreeShippingBar subtotal={subtotal} />
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Subtotal</span>
                    <span className="font-display text-2xl font-bold tabular">{formatCLP(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted">Envío y descuentos se calculan en el checkout.</p>
                  <Button to="/checkout" onClick={close} size="lg" className="w-full">
                    Ir a pagar <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
