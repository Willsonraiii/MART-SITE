import { mapCategory, mapProduct } from '../db/map.js'
import { query } from '../db/pool.js'
import { ApiError } from '../utils/ApiError.js'
import { slugify } from '../utils/id.js'

const TONES = ['leaf', 'coral', 'rose', 'sky', 'wheat', 'sun', 'mocha', 'teal', 'olive', 'lilac', 'slate', 'cocoa']

export async function listCategories() {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.sort_order, c.name`,
  )
  return rows.map((row) => mapCategory(row, row.count))
}

export async function getCategory(id) {
  const { rows } = await query('SELECT * FROM categories WHERE id = $1', [id])
  if (!rows[0]) throw ApiError.notFound('That aisle is not on the map.')
  const products = await query('SELECT * FROM products WHERE category_id = $1', [id])
  return {
    ...mapCategory(rows[0], products.rows.length),
    products: products.rows.map(mapProduct),
  }
}

export async function createCategory(body) {
  const name = String(body?.name || '').trim()
  if (!name || name.length < 2) throw ApiError.unprocessable('Name the aisle.', { name: 'Required.' })
  const tone = TONES.includes(body?.tone) ? body.tone : 'leaf'
  let id = slugify(body?.id || name, 'aisle')
  const clash = await query('SELECT 1 FROM categories WHERE id = $1', [id])
  if (clash.rows.length) id = `${id}-${Date.now().toString().slice(-4)}`
  const { rows: max } = await query('SELECT COALESCE(MAX(sort_order), -1)::int AS n FROM categories')
  const { rows } = await query(
    `INSERT INTO categories (id, name, tone, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, name, tone, max[0].n + 1],
  )
  return mapCategory(rows[0], 0)
}

export async function updateCategory(id, body) {
  const { rows: current } = await query('SELECT * FROM categories WHERE id = $1', [id])
  if (!current[0]) throw ApiError.notFound('That aisle is not on the map.')
  const name = String(body?.name ?? current[0].name).trim()
  if (!name || name.length < 2) throw ApiError.unprocessable('Name the aisle.', { name: 'Required.' })
  const tone = TONES.includes(body?.tone) ? body.tone : current[0].tone
  const { rows } = await query(
    `UPDATE categories SET name = $1, tone = $2 WHERE id = $3 RETURNING *`,
    [name, tone, id],
  )
  const count = await query('SELECT COUNT(*)::int AS n FROM products WHERE category_id = $1', [id])
  return mapCategory(rows[0], count.rows[0].n)
}

export async function deleteCategory(id) {
  const { rows } = await query('SELECT * FROM categories WHERE id = $1', [id])
  if (!rows[0]) throw ApiError.notFound('That aisle is not on the map.')
  const used = await query('SELECT COUNT(*)::int AS n FROM products WHERE category_id = $1', [id])
  if (used.rows[0].n > 0) {
    throw ApiError.conflict('Move or delete the products in this aisle first.', {
      count: used.rows[0].n,
    })
  }
  await query('DELETE FROM categories WHERE id = $1', [id])
  return { id, deleted: true }
}

export async function reorderCategories(ids) {
  const list = Array.isArray(ids) ? ids.map(String) : []
  if (!list.length) throw ApiError.unprocessable('Pass the aisle order.', { ids: 'Required.' })
  for (const [i, id] of list.entries()) {
    await query('UPDATE categories SET sort_order = $1 WHERE id = $2', [i, id])
  }
  return listCategories()
}
