import { getProductById } from '../data/api'

export const CART_KEY = 'yalamber-cart-v1'
export const ORDER_KEY = 'yalamber-last-order'
export const FREE_DELIVERY_OVER = 1000
export const DELIVERY_FEE = 50

export function stockMax(product) {
  if (!product || product.stock === 'out') return 0
  if (product.stock === 'low') return 3
  return 12
}

export function lineSavings(item) {
  if (!item.originalPrice || item.originalPrice <= item.price) return 0
  return (item.originalPrice - item.price) * item.qty
}

export function toCartItem(product, qty) {
  const max = stockMax(product)
  const safeQty = Math.min(Math.max(1, qty), max || 0)
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    weight: product.weight,
    price: product.price,
    originalPrice: product.originalPrice || null,
    discount: product.discount || 0,
    stock: product.stock,
    stockLabel: product.stockLabel,
    category: product.category,
    qty: safeQty,
    subtotal: product.price * safeQty,
  }
}

export function summarize(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = items.reduce((sum, item) => sum + lineSavings(item), 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const delivery = items.length === 0 ? 0 : subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE
  return {
    count,
    subtotal,
    discount,
    delivery,
    total: subtotal + delivery,
    freeDelivery: items.length > 0 && delivery === 0,
    remainingForFree: Math.max(0, FREE_DELIVERY_OVER - subtotal),
  }
}

export function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .map((line) => {
        const live = getProductById(line.id)
        const product = live || line
        if (!product?.id || product.stock === 'out') return null
        return toCartItem(product, line.qty)
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export function saveCart(items) {
  try {
    const slim = items.map((item) => ({ id: item.id, qty: item.qty }))
    localStorage.setItem(CART_KEY, JSON.stringify(slim))
  } catch {
    /* ignore quota */
  }
}

export function loadOrder() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveOrder(order) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order))
  } catch {
    /* ignore */
  }
}

export function makeOrderId() {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `YM-${stamp}-${rand}`
}
