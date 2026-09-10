export const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', id: 'dash' },
  { to: '/admin/orders', label: 'Orders', id: 'orders' },
  { to: '/admin/products', label: 'Products', id: 'products' },
  { to: '/admin/categories', label: 'Categories', id: 'categories' },
  { to: '/admin/inventory', label: 'Inventory', id: 'inventory' },
  { to: '/admin/offers', label: 'Offers', id: 'offers' },
  { to: '/admin/customers', label: 'Customers', id: 'customers' },
  { to: '/admin/settings', label: 'Settings', id: 'settings' },
]

export const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

export const PAY_LABEL = {
  cod: 'Cash on Delivery',
  esewa: 'eSewa',
  khalti: 'Khalti',
  fonepay: 'Fonepay',
}

export const STOCK_OPTIONS = [
  { id: 'in', label: 'In stock' },
  { id: 'low', label: 'Low stock' },
  { id: 'out', label: 'Out of stock' },
]

export const TONES = ['leaf', 'coral', 'rose', 'sky', 'wheat', 'sun', 'mocha', 'teal', 'olive', 'lilac', 'slate', 'cocoa']

export const OFFER_KINDS = [
  { id: 'banner', label: 'Banner' },
  { id: 'percent', label: 'Percentage discount' },
  { id: 'fixed', label: 'Fixed discount' },
  { id: 'bogo', label: 'Buy X Get Y' },
]

export function statusLabel(id) {
  return STATUS_OPTIONS.find((s) => s.id === id)?.label || id
}
