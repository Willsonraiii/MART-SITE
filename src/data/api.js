import { catalog, SORTS } from './catalog'

const PAGE_SIZE = 12
let remoteCatalog = null

export function setRemoteCatalog(list) {
  remoteCatalog = Array.isArray(list) && list.length ? list : null
}

function source() {
  return remoteCatalog || catalog
}

const CATEGORY_NAMES = {
  noodles: 'Instant Noodles',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy',
  bakery: 'Bakery',
  snacks: 'Snacks',
  tea: 'Tea & Coffee',
  beverages: 'Beverages',
  groceries: 'Groceries',
  care: 'Personal Care',
  household: 'Household',
  chocolates: 'Chocolates',
}

function haystack(product) {
  return [
    product.name,
    product.brand,
    product.category,
    CATEGORY_NAMES[product.category] || '',
    product.description,
    product.note,
    product.weight,
    ...(product.keywords || []),
  ]
    .join(' ')
    .toLowerCase()
}

export function getAllProducts() {
  return source()
}

export function getProductById(id) {
  return source().find((p) => p.id === id) || catalog.find((p) => p.id === id) || null
}

export function getFeaturedProducts() {
  return source().filter((p) => p.featured)
}

export function getProductsByCategory(categoryId) {
  return source().filter((p) => p.category === categoryId)
}

export function searchProducts(query, limit = 8) {
  const q = query.trim().toLowerCase()
  const list = source()
  if (!q) return list.slice(0, limit)
  const tokens = q.split(/\s+/).filter(Boolean)
  const hits = list.filter((p) => {
    const hay = haystack(p)
    return tokens.every((t) => hay.includes(t))
  })
  return typeof limit === 'number' ? hits.slice(0, limit) : hits
}

export function getRelated(product, limit = 4) {
  if (!product) return []
  return source()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .sort((a, b) => b.popular - a.popular)
    .slice(0, limit)
}

function sortList(list, sort) {
  const copy = list.slice()
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'discount':
      return copy.sort((a, b) => b.discount - a.discount || a.price - b.price)
    case 'popular':
    default:
      return copy.sort((a, b) => b.popular - a.popular)
  }
}

export function queryProducts({
  q = '',
  category = '',
  sort = 'popular',
  minPrice = null,
  maxPrice = null,
  availability = 'all',
  discounted = false,
  page = 1,
  pageSize = PAGE_SIZE,
} = {}) {
  let list = source().slice()

  if (category) list = list.filter((p) => p.category === category)

  if (q.trim()) {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    list = list.filter((p) => {
      const hay = haystack(p)
      return tokens.every((t) => hay.includes(t))
    })
  }

  if (minPrice != null && minPrice !== '') {
    list = list.filter((p) => p.price >= Number(minPrice))
  }
  if (maxPrice != null && maxPrice !== '') {
    list = list.filter((p) => p.price <= Number(maxPrice))
  }

  if (availability === 'in') list = list.filter((p) => p.stock === 'in')
  if (availability === 'low') list = list.filter((p) => p.stock === 'low')
  if (availability === 'available') list = list.filter((p) => p.stock !== 'out')

  if (discounted) list = list.filter((p) => p.discount > 0)

  list = sortList(list, sort)

  const total = list.length
  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return { items, total, page: safePage, pageSize, pageCount, sorts: SORTS }
}

export { PAGE_SIZE }
