import { STOCK_CAP } from '../config/constants.js'
import { query } from '../db/pool.js'
import { findProduct } from './productService.js'
import { toCartShape } from './cartShape.js'

function cap(product, qty) {
  const max = STOCK_CAP[product.stock] ?? STOCK_CAP.in
  return Math.min(max, Math.max(0, Number(qty) || 0))
}

export async function getCart(userId) {
  const { rows } = await query(
    `SELECT c.qty, p.*
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1`,
    [userId],
  )
  const items = []
  for (const row of rows) {
    const product = {
      id: row.id,
      name: row.name,
      brand: row.brand,
      image: row.image,
      weight: row.weight,
      unit: row.unit,
      price: Number(row.price),
      originalPrice: row.original_price != null ? Number(row.original_price) : null,
      discount: Number(row.discount || 0),
      stock: row.stock,
      stockLabel: row.stock_label,
      category: row.category_id,
    }
    if (product.stock === 'out') continue
    items.push(toCartShape(product, row.qty))
  }
  return items
}

export async function replaceCart(userId, lines = []) {
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId])
  for (const line of lines) {
    const product = await findProduct(line.id)
    if (!product || product.stock === 'out') continue
    const qty = cap(product, line.qty)
    if (qty < 1) continue
    await query(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET qty = EXCLUDED.qty`,
      [userId, product.id, qty],
    )
  }
  return getCart(userId)
}

export async function mergeCart(userId, lines = []) {
  for (const line of lines) {
    const product = await findProduct(line.id)
    if (!product || product.stock === 'out') continue
    const { rows } = await query(
      'SELECT qty FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product.id],
    )
    const current = Number(rows[0]?.qty || 0)
    const incoming = Number(line.qty) || 0
    const qty = cap(product, Math.max(current, incoming))
    if (qty < 1) continue
    await query(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET qty = EXCLUDED.qty`,
      [userId, product.id, qty],
    )
  }
  return getCart(userId)
}

export async function setCartItem(userId, productId, qty) {
  const product = await findProduct(productId)
  if (!product) return getCart(userId)
  const next = cap(product, qty)
  if (next < 1 || product.stock === 'out') {
    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
  } else {
    await query(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET qty = EXCLUDED.qty`,
      [userId, productId, next],
    )
  }
  return getCart(userId)
}

export async function removeCartItem(userId, productId) {
  await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
  return getCart(userId)
}
