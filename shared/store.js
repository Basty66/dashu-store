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

export const FOUNDER = {
  name: 'Tomás Morales',
  role: 'Barbero educador · Fundador de Imperio Barber',
  city: 'Melipilla',
  yearsInBarbering: 11,
  // Ruta de una foto en /public (ej: '/img/tomas.webp'). Sin foto se muestra un monograma.
  photo: null,
}

// Formatos de venta disponibles para cada producto (unidades por pack).
export const PACK_SIZES = [1, 3, 10]

// Pack destacado como "Más elegido" en la tienda.
export const HIGHLIGHT_PACK_UNITS = 3

// Programa de distribuidores: compra mínima por embalajes cerrados.
export const DISTRIBUTOR = {
  unitsPerBox: 30,
  minBoxes: 3,
  unitCost: 19000,
}
export const DISTRIBUTOR_MIN_UNITS = DISTRIBUTOR.unitsPerBox * DISTRIBUTOR.minBoxes
export const DISTRIBUTOR_MIN_TOTAL = DISTRIBUTOR_MIN_UNITS * DISTRIBUTOR.unitCost

// Tiempo que se reserva el stock (o el cupo de un seminario) mientras el cliente paga en Mercado Pago.
export const PAYMENT_WINDOW_MINUTES = 60
