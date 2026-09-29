import { create } from 'zustand'

let nextId = 1

export const useToasts = create((set) => ({
  toasts: [],
  push: (message, tone = 'default') => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = (message, tone) => useToasts.getState().push(message, tone)
