// Tarifas de despacho por región (CLP) y couriers con su página de seguimiento.

export const SHIPPING_RATES = {
  'Arica y Parinacota': 7000,
  'Tarapacá': 7000,
  'Antofagasta': 6000,
  'Atacama': 5000,
  'Coquimbo': 5000,
  'Valparaíso': 3000,
  'Metropolitana de Santiago': 3000,
  "Libertador General Bernardo O'Higgins": 3000,
  'Maule': 4000,
  'Ñuble': 4000,
  'Biobío': 4000,
  'La Araucanía': 5000,
  'Los Ríos': 5000,
  'Los Lagos': 6000,
  'Aysén del General Carlos Ibáñez del Campo': 8000,
  'Magallanes y de la Antártica Chilena': 10000,
}

// Envío gratis desde este subtotal (después de descuentos). null = desactivado.
export const FREE_SHIPPING_FROM = 150000

export function shippingCostFor(region, subtotalAfterDiscount) {
  if (!region || !(region in SHIPPING_RATES)) return null
  if (FREE_SHIPPING_FROM !== null && subtotalAfterDiscount >= FREE_SHIPPING_FROM) return 0
  return SHIPPING_RATES[region]
}

export const COURIERS = {
  starken: {
    name: 'Starken',
    trackingUrl: (code) => `https://www.starken.cl/seguimiento?codigo=${encodeURIComponent(code)}`,
  },
  chilexpress: {
    name: 'Chilexpress',
    trackingUrl: (code) => `https://centrodeayuda.chilexpress.cl/seguimiento/${encodeURIComponent(code)}`,
  },
  bluexpress: {
    name: 'Blue Express',
    trackingUrl: (code) => `https://www.blue.cl/enviar/seguimiento?n_seguimiento=${encodeURIComponent(code)}`,
  },
  correos: {
    name: 'Correos de Chile',
    trackingUrl: (code) => `https://www.correos.cl/web/guest/seguimiento-en-linea?codigos=${encodeURIComponent(code)}`,
  },
  otro: { name: 'Otro courier', trackingUrl: null },
}

export function courierName(key) {
  return COURIERS[key]?.name || key || ''
}

// URL final de seguimiento: la manual tiene prioridad sobre la generada por courier.
export function resolveTrackingUrl(courier, trackingNumber, manualUrl) {
  if (manualUrl) return manualUrl
  const build = COURIERS[courier]?.trackingUrl
  return build && trackingNumber ? build(trackingNumber) : null
}
