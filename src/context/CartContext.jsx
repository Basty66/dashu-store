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
      if (existing) {
        return state.map(i =>
          i.id === action.item.id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
        )
      }
      return [...state, { ...action.item, quantity: 1 }]
    }
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) return state.filter(i => i.id !== action.id)
      return state.map(i => (i.id === action.id ? { ...i, quantity: action.quantity } : i))
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

  const addItem = useCallback((item, sourceRect) => {
    dispatch({ type: 'ADD_ITEM', item })

    if (sourceRect && item.image) {
      const cartEl = document.querySelector('[data-cart-target]')
      const targetRect = cartEl?.getBoundingClientRect()
      if (targetRect) {
        if (flyTimer.current) clearTimeout(flyTimer.current)
        setFlyItem({ left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height, image: item.image })
        flyTimer.current = setTimeout(() => setFlyItem(null), 700)
      }
    }
  }, [])

  const updateQuantity = useCallback((id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity }), [])
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, totalItems, isOpen, setIsOpen, flyItem, setFlyItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
