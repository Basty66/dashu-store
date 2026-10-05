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
  photo: '/img/tomas.webp',
}

// Formatos sugeridos al crear un producto nuevo (unidades por pack).
export const PACK_SIZES = [1, 3, 10]

// El pack destacado, el programa de distribuidores, los envíos y la barra de anuncios se
// editan en Admin → Ajustes (valores por defecto en shared/storeConfig.js).

// Tiempo que se reserva el stock (o el cupo de un seminario) mientras el cliente paga en Mercado Pago.
export const PAYMENT_WINDOW_MINUTES = 60
