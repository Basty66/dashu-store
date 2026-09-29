import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Zap, TrendingDown, Store } from 'lucide-react'
import { formatCLP, packSavings, packUnitPrice, sortPacks, nextPackUpsell, packLabelLong } from '@shared/pricing.js'
import { HIGHLIGHT_PACK_UNITS, DISTRIBUTOR } from '@shared/store.js'
import { useCart } from '../../store/cart'
import { toast } from '../../store/toast'
import { Button } from '../atoms/Button'
import { PackOption } from '../molecules/PackOption'
import { QuantityStepper } from '../molecules/QuantityStepper'

// Selector de formato + cantidad + agregar al carrito. Es el corazón de la venta por volumen.
export function BuyBox({ product }) {
  const navigate = useNavigate()
  const add = useCart((s) => s.add)
  const inCart = useCart((s) => s.items.filter((i) => i.productId === product.id).reduce((n, i) => n + i.packUnits * i.quantity, 0))
  const packs = useMemo(() => sortPacks(product.packs), [product.packs])
  const available = Math.max(0, product.stock - inCart)

  const defaultPack = packs.find((p) => p.units === HIGHLIGHT_PACK_UNITS && p.units <= available) || packs.find((p) => p.units <= available) || packs[0]
  const [units, setUnits] = useState(defaultPack?.units)
  const [quantity, setQuantity] = useState(1)

  const pack = packs.find((p) => p.units === units) || defaultPack
  const maxQuantity = Math.max(1, Math.min(99, Math.floor(available / pack.units)))
  const qty = Math.min(quantity, maxQuantity)
  const soldOut = available < pack.units
  const upsell = nextPackUpsell(pack.units, packs)
  const totalUnits = pack.units * qty
  const savings = packSavings(pack, packs)

  function addToCart(goToCheckout) {
    if (soldOut) return
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0] || null,
      packUnits: pack.units,
      unitPrice: pack.price,
      quantity: qty,
    })
    setQuantity(1)
    if (goToCheckout) {
      useCart.getState().close()
      navigate('/checkout')
    } else {
      toast(`Agregaste ${qty} × ${packLabelLong(pack.units)}`, 'success')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between text-sm font-medium">
          Elige tu formato
          <span className="font-normal text-muted">Precio por volumen</span>
        </legend>
        <div className="flex flex-col gap-2.5" role="radiogroup">
          {packs.map((p) => (
            <PackOption
              key={p.units}
              pack={p}
              savings={packSavings(p, packs)}
              selected={p.units === pack.units}
              highlight={p.units === HIGHLIGHT_PACK_UNITS}
              disabled={p.units > available}
              onSelect={() => {
                setUnits(p.units)
                setQuantity(1)
              }}
            />
          ))}
        </div>
      </fieldset>

      {upsell && !soldOut && upsell.pack.units <= available && (
        <button
          type="button"
          onClick={() => setUnits(upsell.pack.units)}
          className="flex items-center gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold/[0.07] px-4 py-3 text-left text-sm transition-colors duration-200 hover:bg-gold/15"
        >
          <TrendingDown size={18} className="flex-none text-gold-deep" aria-hidden="true" />
          <span>
            Con el <strong>{packLabelLong(upsell.pack.units)}</strong> pagas{' '}
            <strong className="tabular">{formatCLP(upsell.savingPerUnit)} menos</strong> por unidad.
          </span>
        </button>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={qty} max={maxQuantity} onChange={setQuantity} label="Cantidad de packs" />
        <div className="text-sm leading-tight">
          <p className="font-medium tabular">{totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}</p>
          <p className="text-muted tabular">{formatCLP(packUnitPrice(pack))} c/u{savings.percent > 0 ? ` · ahorras ${formatCLP(savings.amount * qty)}` : ''}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:flex-1" onClick={() => addToCart(false)} disabled={soldOut}>
          <ShoppingBag size={18} aria-hidden="true" />
          {soldOut ? 'Sin stock' : `Agregar · ${formatCLP(pack.price * qty)}`}
        </Button>
        <Button size="lg" variant="gold" className="w-full sm:w-48" onClick={() => addToCart(true)} disabled={soldOut}>
          <Zap size={18} aria-hidden="true" /> Comprar ya
        </Button>
      </div>

      <p className="text-sm text-muted">
        {product.stock <= 0 ? (
          <span className="font-medium text-danger">Agotado por ahora. Escríbenos para avisarte cuando llegue.</span>
        ) : product.stock < 40 ? (
          <span className="font-medium text-warning">Quedan {product.stock} unidades en stock</span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> En stock, listo para despacho
          </span>
        )}
        {' · '}
        <Link to="/distribuidores" className="inline-flex items-center gap-1 font-medium text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">
          <Store size={14} aria-hidden="true" /> ¿Revendes? Distribuidores desde {formatCLP(DISTRIBUTOR.unitCost)} c/u
        </Link>
      </p>
    </div>
  )
}
