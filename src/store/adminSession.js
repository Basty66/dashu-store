import { create } from 'zustand'

// Persona conectada al panel (nombre, correo, rol). La sesión real vive en una cookie HttpOnly.
export const useAdminSession = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
