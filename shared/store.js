// Configuración central de la tienda. Cambia aquí nombre, textos y reglas comerciales.

export const STORE = {
  name: 'DASHU STORE',
  wordmark: 'DASHU',
  wordmarkSuffix: 'STORE',
  tagline: 'Distribuidora en Chile',
  url: 'https://dashu-store.vercel.app',
  email: 'contacto@dashu.store',
  hours: 'Lunes a viernes, 10:00 a 18:00',
  // Aviso legal: venden con permiso de la marca, pero no son el distribuidor oficial.
  legalNotice:
    'Venta autorizada de productos DASHU en Chile. DASHU STORE no es el distribuidor oficial de la marca DASHU (Corea).',
}

// Formatos de venta disponibles para cada producto (unidades por pack).
export const PACK_SIZES = [1, 5, 10, 20, 40]

// Pack destacado como "Más vendido" en la tienda.
export const HIGHLIGHT_PACK_UNITS = 10

// Pedidos sobre este número de unidades se derivan a cotización por WhatsApp.
export const WHOLESALE_CONTACT_FROM_UNITS = 80

// Tiempo que se reserva el stock mientras el cliente paga en Mercado Pago.
export const PAYMENT_WINDOW_MINUTES = 60
