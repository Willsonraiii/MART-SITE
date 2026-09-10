import { env } from '../config/env.js'
import { ORDER_STATUSES, PAYMENT_METHODS, STOCK_CAP } from '../config/constants.js'
import { mapOrder } from '../db/map.js'
import { query, withTransaction } from '../db/pool.js'
import { ApiError } from '../utils/ApiError.js'
import { makeOrderId } from '../utils/id.js'
import { normalizePhone, PHONE_RE } from '../utils/phone.js'
import { findProduct } from './productService.js'

const NAME = /^[\p{L}\s.'-]+$/u

function stockMax(product) {
  return STOCK_CAP[product.stock] ?? STOCK_CAP.in
}

function lineSavings(item) {
  if (!item.originalPrice || item.originalPrice <= item.price) return 0
  return (item.originalPrice - item.price) * item.qty
}

export function validateOrderPayload(body) {
  const errors = {}
  const customer = body?.customer || {}
  const fullName = String(customer.fullName || '').trim()
  const phone = normalizePhone(customer.phone)
  const addressLine = String(customer.address || '').trim()
  const city = String(customer.city || '').trim()
  const paymentMethod = String(body?.paymentMethod || body?.payment || '').trim()
  const items = Array.isArray(body?.items) ? body.items : []

  if (!fullName || fullName.length < 2) errors.fullName = 'Enter your full name.'
  else if (!NAME.test(fullName)) errors.fullName = 'Use letters only in the name.'
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid Nepal mobile number.'
  if (!addressLine || addressLine.length < 6) errors.address = 'Add a delivery address we can find.'
  if (!city) errors.city = 'Choose an area.'
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    errors.paymentMethod = 'Choose a payment method.'
  }
  if (!items.length) errors.items = 'Your bag is empty.'

  if (Object.keys(errors).length) {
    throw ApiError.unprocessable('Please check the order details.', errors)
  }

  return {
    customer: {
      fullName,
      phone,
      address: addressLine,
      landmark: String(customer.landmark || '').trim(),
      city,
      notes: String(customer.notes || '').trim(),
    },
    paymentMethod,
    items: items.map((line) => ({
      id: String(line.id || ''),
      qty: Math.max(1, Number(line.qty) || 1),
    })),
  }
}

async function buildLines(rawItems) {
  const lines = []
  for (const line of rawItems) {
    const product = await findProduct(line.id)
    if (!product) {
      throw ApiError.unprocessable('One of the products is no longer on the rack.', {
        items: `Unknown product: ${line.id}`,
      })
    }
    if (product.stock === 'out') {
      throw ApiError.unprocessable(`${product.name} is out of stock.`, { items: product.id })
    }
    const max = stockMax(product)
    const qty = Math.min(max, Math.max(1, line.qty))
    if (qty < 1) {
      throw ApiError.unprocessable(`${product.name} cannot be ordered.`, { items: product.id })
    }
    lines.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      weight: product.weight,
      unit: product.unit,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      qty,
      subtotal: product.price * qty,
    })
  }
  return lines
}

async function loadDeliveryRules() {
  const { rows } = await query(
    `SELECT key, value FROM settings WHERE key IN ('deliveryFee', 'freeDeliveryOver')`,
  )
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]))
  const deliveryFee = Number(map.deliveryFee)
  const freeDeliveryOver = Number(map.freeDeliveryOver)
  return {
    deliveryFee: Number.isFinite(deliveryFee) ? deliveryFee : env.deliveryFee,
    freeDeliveryOver: Number.isFinite(freeDeliveryOver) ? freeDeliveryOver : env.freeDeliveryOver,
  }
}

async function totalsFor(items) {
  const rules = await loadDeliveryRules()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = items.reduce((sum, item) => sum + lineSavings(item), 0)
  const deliveryFee = items.length === 0 ? 0 : subtotal >= rules.freeDeliveryOver ? 0 : rules.deliveryFee
  return {
    subtotal,
    discount,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

async function loadOrderWithItems(orderRow) {
  const { rows } = await query('SELECT * FROM order_items WHERE order_id = $1', [orderRow.id])
  return mapOrder(orderRow, rows)
}

export async function createOrder(body, user = null) {
  const payload = validateOrderPayload(body)
  const items = await buildLines(payload.items)
  const money = await totalsFor(items)
  const id = makeOrderId()
  const eta = 'Today, 45–90 minutes'
  const paymentNote = payload.paymentMethod === 'cod' ? 'Pay on delivery' : 'UI only — not charged'

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_email,
        address_line, landmark, city, notes, payment_method, status,
        subtotal, discount, delivery_fee, total, eta, payment_note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'confirmed',$11,$12,$13,$14,$15,$16)`,
      [
        id,
        user?.id || null,
        payload.customer.fullName,
        payload.customer.phone,
        user?.email || null,
        payload.customer.address,
        payload.customer.landmark,
        payload.customer.city,
        payload.customer.notes,
        payload.paymentMethod,
        money.subtotal,
        money.discount,
        money.deliveryFee,
        money.total,
        eta,
        paymentNote,
      ],
    )
    for (const line of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, unit_price, subtotal, image, brand, weight)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, line.id, line.name, line.qty, line.price, line.subtotal, line.image, line.brand, line.weight],
      )
    }
    if (user?.id) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [user.id])
    }
  })

  return getOrder(id)
}

export async function getOrder(id) {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id])
  if (!rows[0]) throw ApiError.notFound('We couldn’t find that order.')
  return loadOrderWithItems(rows[0])
}

export async function listOrdersForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  )
  const out = []
  for (const row of rows) out.push(await loadOrderWithItems(row))
  return out
}

export async function listAllOrders() {
  const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200')
  const out = []
  for (const row of rows) out.push(await loadOrderWithItems(row))
  return out
}

export async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw ApiError.unprocessable('Unknown order status.', { status: 'Pick a valid status.' })
  }
  const { rows } = await query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id],
  )
  if (!rows[0]) throw ApiError.notFound('We couldn’t find that order.')
  return loadOrderWithItems(rows[0])
}
