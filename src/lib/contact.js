import { useConfig } from '../store/storeConfig'

// Respaldo mientras el número no se cargue en Admin → Ajustes.
const ENV_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || ''

export function useWhatsappNumber() {
  return useConfig((c) => c.contact.whatsapp) || ENV_WHATSAPP
}

export function whatsappLink(number, text = 'Hola DASHU STORE, quiero hacer una consulta') {
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
