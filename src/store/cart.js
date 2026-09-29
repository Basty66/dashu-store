import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const lineKey = (productId, packUnits) => `${productId}:${packUnits}`

// Carrito persistente. Los precios aquí son referenciales: el total real lo calcula el servidor.
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      add: (line) =>
        set((state) => {
          const key = lineKey(line.productId, line.packUnits)
          const existing = state.items.find((i) => lineKey(i.productId, i.packUnits) === key)
          const items = existing
            ? state.items.map((i) => (i === existing ? { ...i, quantity: Math.min(99, i.quantity + line.quantity) } : i))
            : [...state.items, line]
          return { items, isOpen: true }
        }),

      setQuantity: (productId, packUnits, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId && i.packUnits === packUnits ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),

      remove: (productId, packUnits) =>
        set((state) => ({ items: state.items.filter((i) => !(i.productId === productId && i.packUnits === packUnits)) })),

      // Cambia una línea a otro formato (upsell "sube a pack de 10").
      switchPack: (productId, fromUnits, toPack) =>
        set((state) => {
          const items = state.items.filter((i) => !(i.productId === productId && i.packUnits === fromUnits))
          const target = items.find((i) => i.productId === productId && i.packUnits === toPack.units)
          if (target) return { items: items.map((i) => (i === target ? { ...i, quantity: i.quantity + 1 } : i)) }
          const source = state.items.find((i) => i.productId === productId && i.packUnits === fromUnits)
          return { items: [...items, { ...source, packUnits: toPack.units, unitPrice: toPack.price, quantity: 1 }] }
        }),

      clear: () => set({ items: [] }),

      // Alinea los precios guardados con los que devuelve el servidor.
      syncPrices: (lines) =>
        set((state) => {
          let changed = false
          const items = state.items.map((i) => {
            const server = lines.find((l) => l.productId === i.productId && l.packUnits === i.packUnits)
            if (server && server.unitPrice !== i.unitPrice) {
              changed = true
              return { ...i, unitPrice: server.unitPrice, title: server.title }
            }
            return i
          })
          return changed ? { items } : state
        }),

      unitsOf: (productId) =>
        get().items.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.packUnits * i.quantity, 0),
    }),
    {
      name: 'dashu-cart-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const cartCount = (items) => items.reduce((sum, i) => sum + i.quantity, 0)
export const cartUnits = (items) => items.reduce((sum, i) => sum + i.packUnits * i.quantity, 0)
export const cartSubtotal = (items) => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
