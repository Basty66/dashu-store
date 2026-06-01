import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CartContext = createContext()
const STORAGE_KEY = 'dashu-cart'
const FREE_SHIPPING_THRESHOLD = 50000

function loadCart() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : [] }
  catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }, [items])

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...product, quantity }]
    })
    setIsOpen(true)
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) { setItems(prev => prev.filter(i => i.id !== id)); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setItems([])

  const { totalItems, subtotal } = useMemo(() => ({
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }), [items])

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <CartContext.Provider value={{
      items, isOpen, totalItems, subtotal, freeShippingRemaining, freeShippingProgress,
      setIsOpen, addItem, updateQuantity, removeItem, clearCart, FREE_SHIPPING_THRESHOLD,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
