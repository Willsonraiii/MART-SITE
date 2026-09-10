import { ORDER_STATUSES } from '../config/constants.js'

export function isOrderStatus(value) {
  return ORDER_STATUSES.includes(value)
}

export function publicOrder(order) {
  return {
    id: order.id,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    total: order.total,
    address: order.address,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
    eta: order.eta,
  }
}
