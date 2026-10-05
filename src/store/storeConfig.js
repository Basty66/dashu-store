import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_STORE_CONFIG, distributorMinimum, readStoreConfig } from '@shared/storeConfig.js'
import { api } from '../lib/api'

// Ajustes de la tienda (Admin → Ajustes). Parte con la última versión guardada en este navegador
// (o los valores por defecto) y se actualiza desde /api/settings al abrir el sitio.
export const useStoreConfig = create(
  persist(
    (set) => ({
      config: DEFAULT_STORE_CONFIG,
      load: async () => {
        try {
          set({ config: readStoreConfig(await api('/settings')) })
        } catch {
          // Sin conexión se mantiene lo último conocido.
        }
      },
      // El admin, al guardar, actualiza la vista de inmediato.
      replace: (config) => set({ config: readStoreConfig(config) }),
    }),
    {
      name: 'dashu-ajustes',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ config: state.config }),
      merge: (persisted, current) => ({ ...current, config: readStoreConfig(persisted?.config) }),
    },
  ),
)

export const useConfig = (selector) => useStoreConfig((state) => selector(state.config))

// Programa de distribuidores con su pedido mínimo calculado.
export function useDistributor() {
  const distributor = useConfig((c) => c.distributor)
  return { ...distributor, ...minimum(distributor) }
}

function minimum(distributor) {
  const { units, total } = distributorMinimum(distributor)
  return { minUnits: units, minTotal: total }
}
