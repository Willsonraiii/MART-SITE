import { PAGE_SIZE, SORTS, STOCK_LABEL } from '../config/constants.js'
import { mapProduct } from '../db/map.js'
import { query } from '../db/pool.js'
import { ApiError } from '../utils/ApiError.js'
import { asBoolean, parsePositiveInt } from '../middleware/validate.js'
import { slugify } from '../utils/id.js'

export async function allProducts() {
  const { rows } = await query('SELECT * FROM products')
  return rows.map(mapProduct)
}

export async function listProducts(queryParams = {}) {
  const category = String(queryParams.category || '').trim()
  const q = String(queryParams.q || '').trim()
  const availability = String(queryParams.stock || queryParams.availability || 'all')
  const discounted = asBoolean(queryParams.discounted)
  const featured = asBoolean(queryParams.featured)
  const sort = String(queryParams.sort || 'popular')
  const pageSize = Math.min(100, Math.max(1, parsePositiveInt(queryParams.pageSize || queryParams.limit, PAGE_SIZE)))
  const page = Math.max(1, parsePositiveInt(queryParams.page, 1))
  const start = (page - 1) * pageSize

  const where = []
  const params = []
  const add = (sql, value) => {
    params.push(value)
    where.push(sql.replace('?', `$${params.length}`))
  }

  if (category) add('category_id = ?', category)
  if (availability === 'in' || availability === 'low' || availability === 'out') add('stock = ?', availability)
  if (availability === 'available') where.push(`stock <> 'out'`)
  if (featured) where.push('featured = true')
  if (discounted) where.push('discount > 0')
  if (queryParams.min != null && queryParams.min !== '') {
    const min = Number(queryParams.min)
    if (Number.isFinite(min)) add('price >= ?', min)
  }
  if (queryParams.max != null && queryParams.max !== '') {
    const max = Number(queryParams.max)
    if (Number.isFinite(max)) add('price <= ?', max)
  }
  if (q) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6)
    for (const raw of tokens) {
      const token = raw.replace(/[%_]/g, '')
      if (!token) continue
      params.push(`%${token}%`)
      const p = `$${params.length}`
      where.push(`(
        name ILIKE ${p} OR brand ILIKE ${p} OR COALESCE(description,'') ILIKE ${p}
        OR COALESCE(note,'') ILIKE ${p} OR COALESCE(unit,'') ILIKE ${p} OR COALESCE(weight,'') ILIKE ${p}
        OR EXISTS (SELECT 1 FROM unnest(keywords) AS k WHERE k ILIKE ${p})
      )`)
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const orderSql = {
    'price-asc': 'ORDER BY price ASC, name ASC',
    'price-desc': 'ORDER BY price DESC, name ASC',
    'name-asc': 'ORDER BY name ASC',
    newest: 'ORDER BY created_at DESC, name ASC',
    discount: 'ORDER BY discount DESC, price ASC',
    popular: 'ORDER BY popular DESC, name ASC',
  }[sort] || 'ORDER BY popular DESC, name ASC'

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS n FROM products ${whereSql}`, params)
  const listParams = params.concat(pageSize, start)
  const { rows } = await query(
    `SELECT * FROM products ${whereSql} ${orderSql} LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams,
  )
  const { rows: boundRows } = await query(
    'SELECT COALESCE(MIN(price), 0)::float AS min, COALESCE(MAX(price), 0)::float AS max FROM products',
  )
  const total = countRows[0]?.n || 0
  return {
    items: rows.map(mapProduct),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize) || 1),
    sorts: SORTS,
    bounds: {
      min: Number(boundRows[0]?.min || 0),
      max: Number(boundRows[0]?.max || 0),
    },
  }
}

export async function getProduct(id) {
  const product = await findProduct(id)
  if (!product) throw ApiError.notFound('We couldn’t find that product.')
  return product
}

export async function relatedProducts(product, limit = 4) {
  const { rows } = await query(
    `SELECT * FROM products WHERE category_id = $1 AND id <> $2 ORDER BY popular DESC LIMIT $3`,
    [product.category, product.id, limit],
  )
  return rows.map(mapProduct)
}

export async function findProduct(id) {
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [id])
  return mapProduct(rows[0])
}

async function uniqueId(base) {
  let id = base
  let n = 0
  while (true) {
    const { rows } = await query('SELECT 1 FROM products WHERE id = $1', [id])
    if (!rows.length) return id
    n += 1
    id = `${base}-${n}`
  }
}

function parseProductBody(body, existing = {}) {
  const errors = {}
  const name = String(body?.name ?? existing.name ?? '').trim()
  const price = Number(body?.price ?? existing.price)
  const category = String(body?.category ?? body?.categoryId ?? existing.category ?? '').trim()
  const stock = String(body?.stock ?? existing.stock ?? 'in')
  const discount = Math.max(0, Math.min(90, Number(body?.discount ?? existing.discount ?? 0) || 0))
  if (!name || name.length < 2) errors.name = 'Give the product a name.'
  if (!Number.isFinite(price) || price < 0) errors.price = 'Set a valid price.'
  if (!category) errors.category = 'Pick an aisle.'
  if (!['in', 'low', 'out'].includes(stock)) errors.stock = 'Stock must be in, low, or out.'
  if (Object.keys(errors).length) throw ApiError.unprocessable('Please check the product.', errors)

  let originalPrice = body?.originalPrice ?? existing.originalPrice ?? null
  originalPrice = originalPrice == null || originalPrice === '' ? null : Number(originalPrice)
  if (discount > 0 && (originalPrice == null || originalPrice <= price)) {
    originalPrice = Math.round(price / (1 - discount / 100))
  }

  return {
    name,
    brand: String(body?.brand ?? existing.brand ?? '').trim(),
    category,
    description: String(body?.description ?? existing.description ?? '').trim(),
    price,
    originalPrice,
    discount,
    stock,
    stockLabel: STOCK_LABEL[stock] || STOCK_LABEL.in,
    unit: String(body?.unit ?? existing.unit ?? body?.weight ?? existing.weight ?? '').trim(),
    weight: String(body?.weight ?? existing.weight ?? body?.unit ?? existing.unit ?? '').trim(),
    image: String(body?.image ?? existing.image ?? '').trim() || '/images/wai-wai.jpg',
    featured: Boolean(body?.featured ?? existing.featured),
    note: String(body?.note ?? existing.note ?? '').trim(),
    keywords: Array.isArray(body?.keywords)
      ? body.keywords.map((k) => String(k))
      : existing.keywords || [],
    model: body?.model ?? existing.model ?? null,
    modelColor: body?.modelColor ?? existing.modelColor ?? '#c45d2c',
    popular: Number(body?.popular ?? existing.popular ?? 50),
  }
}

export async function createProduct(body) {
  const data = parseProductBody(body)
  const { rows: cat } = await query('SELECT id FROM categories WHERE id = $1', [data.category])
  if (!cat[0]) throw ApiError.unprocessable('That aisle is not on the map.', { category: 'Unknown category.' })
  const id = await uniqueId(slugify(body?.id || data.name, 'sku'))
  const { rows } = await query(
    `INSERT INTO products (
      id, name, brand, category_id, description, price, original_price, discount,
      stock, stock_label, unit, weight, image, featured, popular, keywords, model, model_color, note
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING *`,
    [
      id, data.name, data.brand, data.category, data.description, data.price, data.originalPrice,
      data.discount, data.stock, data.stockLabel, data.unit, data.weight, data.image, data.featured,
      data.popular, data.keywords, data.model, data.modelColor, data.note,
    ],
  )
  return mapProduct(rows[0])
}

export async function updateProduct(id, body) {
  const current = await findProduct(id)
  if (!current) throw ApiError.notFound('We couldn’t find that product.')
  const data = parseProductBody(body, current)
  const { rows: cat } = await query('SELECT id FROM categories WHERE id = $1', [data.category])
  if (!cat[0]) throw ApiError.unprocessable('That aisle is not on the map.', { category: 'Unknown category.' })
  const { rows } = await query(
    `UPDATE products SET
      name=$1, brand=$2, category_id=$3, description=$4, price=$5, original_price=$6, discount=$7,
      stock=$8, stock_label=$9, unit=$10, weight=$11, image=$12, featured=$13, popular=$14,
      keywords=$15, model=$16, model_color=$17, note=$18
     WHERE id=$19 RETURNING *`,
    [
      data.name, data.brand, data.category, data.description, data.price, data.originalPrice,
      data.discount, data.stock, data.stockLabel, data.unit, data.weight, data.image, data.featured,
      data.popular, data.keywords, data.model, data.modelColor, data.note, id,
    ],
  )
  return mapProduct(rows[0])
}

export async function deleteProduct(id) {
  const current = await findProduct(id)
  if (!current) throw ApiError.notFound('We couldn’t find that product.')
  await query('DELETE FROM cart_items WHERE product_id = $1', [id])
  await query('UPDATE order_items SET product_id = NULL WHERE product_id = $1', [id])
  await query('DELETE FROM products WHERE id = $1', [id])
  return { id, deleted: true }
}
