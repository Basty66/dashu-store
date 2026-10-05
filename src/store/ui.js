import { create } from 'zustand'

// Estado de interfaz compartido: si hay una barra fija abajo (celular), el botón de WhatsApp sube.
export const useUi = create((set) => ({
  bottomBar: false,
  setBottomBar: (bottomBar) => set({ bottomBar }),
}))
