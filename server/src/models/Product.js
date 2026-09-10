import { STOCK_LABEL } from '../config/constants.js'

export function normalizeProduct(input) {
  const stock = input.stock || 'in'
  const unit = input.unit || input.weight || ''
  return {
    id: String(input.id),
    name: input.name,
    brand: input.brand || '',
    category: input.category,
    description: input.description || '',
    price: Number(input.price),
    originalPrice: input.originalPrice ?? null,
    discount: Number(input.discount || 0),
    stock,
    stockLabel: input.stockLabel || STOCK_LABEL[stock] || STOCK_LABEL.in,
    unit,
    weight: input.weight || unit,
    image: input.image,
    featured: Boolean(input.featured),
    createdAt: input.createdAt || '2026-06-15',
    popular: Number(input.popular ?? 50),
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
    model: input.model || null,
    modelColor: input.modelColor || '#c45d2c',
    note: input.note || '',
  }
}

export function publicProduct(product) {
  return { ...product }
}
