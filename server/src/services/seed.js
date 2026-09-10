import { catalog } from '../../../src/data/catalog.js'
import { categoryMeta, offerSeed } from '../data/meta.js'
import { normalizeProduct } from '../models/Product.js'
import { normalizeCategory } from '../models/Category.js'
import { normalizeOffer } from '../models/Offer.js'

export async function seedDatabase() {
  const products = catalog.map(normalizeProduct)
  const categories = categoryMeta.map((cat) =>
    normalizeCategory(cat, products.filter((p) => p.category === cat.id).length),
  )
  const offers = offerSeed.map(normalizeOffer)
  return { products, categories, offers, orders: [] }
}
