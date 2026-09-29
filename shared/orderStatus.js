// Estados del pedido. `label` es para el admin, `customer` es lo que ve el cliente.

export const ORDER_STATUS = {
  PENDIENTE_PAGO: { label: 'Esperando pago', customer: 'Recibimos tu pedido', tone: 'amber' },
  PAGADO: { label: 'Pagado', customer: 'Pago confirmado', tone: 'green' },
  PREPARANDO: { label: 'Preparando', customer: 'Preparando tu pedido', tone: 'blue' },
  ENVIADO: { label: 'Enviado', customer: 'En camino', tone: 'blue' },
  ENTREGADO: { label: 'Entregado', customer: 'Entregado', tone: 'green' },
  CANCELADO: { label: 'Cancelado', customer: 'Pedido cancelado', tone: 'red' },
  EXPIRADO: { label: 'Pago no completado', customer: 'Pago no completado', tone: 'neutral' },
}

// Camino feliz que se dibuja como línea de tiempo.
export const ORDER_FLOW = ['PENDIENTE_PAGO', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']

// Transiciones que puede hacer el admin a mano.
export const ADMIN_TRANSITIONS = {
  PENDIENTE_PAGO: ['PAGADO', 'CANCELADO'],
  PAGADO: ['PREPARANDO', 'ENVIADO', 'CANCELADO'],
  PREPARANDO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
  EXPIRADO: ['PAGADO', 'CANCELADO'],
}

// Estados que cuentan como venta concretada.
export const PAID_STATUSES = ['PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']

export function statusLabel(status) {
  return ORDER_STATUS[status]?.label || status
}

export function customerStatusLabel(status) {
  return ORDER_STATUS[status]?.customer || status
}
