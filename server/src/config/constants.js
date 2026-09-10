export const PAGE_SIZE = 12

export const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'discount', label: 'Discount' },
]

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export const PAYMENT_METHODS = ['cod', 'esewa', 'khalti', 'fonepay']

export const STOCK_LABEL = {
  in: 'In Stock',
  low: 'Low Stock',
  out: 'Out of Stock',
}

export const STOCK_CAP = {
  out: 0,
  low: 3,
  in: 12,
}
