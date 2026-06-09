import { createContext, useContext, useReducer, useState, useEffect, useCallback, useRef } from 'react'

const CartContext = createContext()

function loadCart() {
  try {
    const saved = localStorage.getItem('dashu_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.item.id)
      const stock = action.item.stock ?? 99
      const qty = action.item.quantity ?? 1
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, stock)
        if (newQty === existing.quantity) return state
        return state.map(i =>
          i.id === action.item.id ? { ...i, quantity: newQty, stock } : { ...i, stock: i.stock ?? 99 }
        )
      }
      const validStock = Math.min(qty, stock)
      if (validStock < 1) return state
      return [...state, { ...action.item, quantity: validStock, stock }]
    }
    case 'UPDATE_QUANTITY': {
      const item = state.find(i => i.id === action.id)
      if (!item) return state
      const stock = item.stock ?? 99
      const qty = Math.max(0, Math.min(action.quantity, stock))
      if (qty <= 0) return state.filter(i => i.id !== action.id)
      return state.map(i => (i.id === action.id ? { ...i, quantity: qty } : i))
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart)

  useEffect(() => {
    localStorage.setItem('dashu_cart', JSON.stringify(items))
  }, [items])

  const [isOpen, setIsOpen] = useState(false)
  const [flyItem, setFlyItem] = useState(null)
  const flyTimer = useRef(null)
  const [stockAlert, setStockAlert] = useState(null)
  const alertTimer = useRef(null)

  const addItem = useCallback((item, qtyOrRect, sourceRect) => {
    const existing = items.find(i => i.id === item.id)
    const stock = item.stock ?? 99
    const isNum = typeof qtyOrRect === 'number'
    const qty = isNum ? (qtyOrRect ?? 1) : 1
    const rect = isNum ? sourceRect : qtyOrRect
    const currentQty = existing ? existing.quantity : 0
    if (currentQty >= stock || stock < 1) {
      if (alertTimer.current) clearTimeout(alertTimer.current)
      setStockAlert({ id: item.id, name: item.name || item.title })
      alertTimer.current = setTimeout(() => setStockAlert(null), 2500)
      return false
    }

    dispatch({ type: 'ADD_ITEM', item: { ...item, stock, quantity: qty } })

    if (rect && item.image) {
      const cartEl = document.querySelector('[data-cart-target]')
      const targetRect = cartEl?.getBoundingClientRect()
      if (targetRect) {
        if (flyTimer.current) clearTimeout(flyTimer.current)
        setFlyItem({ left: rect.left, top: rect.top, width: rect.width, height: rect.height, image: item.image })
        flyTimer.current = setTimeout(() => setFlyItem(null), 700)
      }
    }
    return true
  }, [items])

  const updateQuantity = useCallback((id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity }), [])
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  const maxQtyFor = useCallback((productId, stock) => {
    const item = items.find(i => i.id === productId)
    const inCart = item ? item.quantity : 0
    return Math.max(0, (stock ?? 99) - inCart)
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, totalItems, isOpen, setIsOpen, flyItem, setFlyItem, stockAlert, setStockAlert, maxQtyFor }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
