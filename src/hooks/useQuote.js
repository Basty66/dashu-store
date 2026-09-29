import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useCart } from '../store/cart'

// Pide al servidor los totales reales (precios, stock, envío, cupón) cada vez que cambia algo.
export function useQuote({ region, couponCode }) {
  const items = useCart((s) => s.items)
  const syncPrices = useCart((s) => s.syncPrices)
  const [state, setState] = useState({ quote: null, loading: false, error: null })
  const requestId = useRef(0)

  const payload = JSON.stringify({
    items: items.map(({ productId, packUnits, quantity }) => ({ productId, packUnits, quantity })),
    region: region || null,
    couponCode: couponCode || null,
  })

  useEffect(() => {
    const body = JSON.parse(payload)
    if (!body.items.length) {
      setState({ quote: null, loading: false, error: null })
      return
    }
    const id = ++requestId.current
    const controller = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))
    const timer = setTimeout(() => {
      api('/checkout/quote', { method: 'POST', body, signal: controller.signal })
        .then((quote) => {
          if (id !== requestId.current) return
          syncPrices(quote.lines)
          setState({ quote, loading: false, error: null })
        })
        .catch((error) => {
          if (error.name === 'AbortError' || id !== requestId.current) return
          setState((s) => ({ ...s, loading: false, error }))
        })
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [payload, syncPrices])

  return state
}
