// Couriers con su página de seguimiento. Las tarifas por región y el envío gratis se editan
// en Admin → Ajustes (shared/storeConfig.js).

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
