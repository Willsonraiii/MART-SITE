import { query } from '../db/pool.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const TZ = 'Asia/Kathmandu'

function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function dashboardStats() {
  const today = await query(
    `SELECT
       COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0)::float AS sales,
       COUNT(*)::int AS orders
     FROM orders
     WHERE (created_at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date`,
    [TZ],
  )

  const pending = await query(
    `SELECT COUNT(*)::int AS n FROM orders
     WHERE status IN ('pending', 'confirmed', 'processing', 'out_for_delivery')`,
  )

  const stock = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE stock = 'low')::int AS low,
       COUNT(*) FILTER (WHERE stock = 'out')::int AS out,
       COUNT(*) FILTER (WHERE stock = 'in')::int AS in_stock
     FROM products`,
  )

  const dailyRows = await query(
    `SELECT to_char((created_at AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS bucket,
            COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0)::float AS sales,
            COUNT(*)::int AS orders
     FROM orders
     WHERE created_at >= (now() AT TIME ZONE $1)::date - 13
     GROUP BY 1 ORDER BY 1`,
    [TZ],
  )

  const weeklyRows = await query(
    `SELECT to_char(date_trunc('week', created_at AT TIME ZONE $1), 'YYYY-MM-DD') AS bucket,
            COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0)::float AS sales,
            COUNT(*)::int AS orders
     FROM orders
     WHERE created_at >= now() - interval '8 weeks'
     GROUP BY 1 ORDER BY 1`,
    [TZ],
  )

  const monthlyRows = await query(
    `SELECT to_char(date_trunc('month', created_at AT TIME ZONE $1), 'YYYY-MM') AS bucket,
            COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0)::float AS sales,
            COUNT(*)::int AS orders
     FROM orders
     WHERE created_at >= now() - interval '12 months'
     GROUP BY 1 ORDER BY 1`,
    [TZ],
  )

  const daily = []
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const bucket = isoDate(d)
    const hit = dailyRows.rows.find((row) => row.bucket === bucket)
    daily.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      sales: hit ? Number(hit.sales) : 0,
      orders: hit ? Number(hit.orders) : 0,
    })
  }

  const weekly = []
  for (let i = 7; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const bucket = isoDate(weekStart)
    const hit = weeklyRows.rows.find((row) => row.bucket === bucket)
    weekly.push({
      label: `W${bucket.slice(5)}`,
      sales: hit ? Number(hit.sales) : 0,
      orders: hit ? Number(hit.orders) : 0,
    })
  }

  const monthly = []
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const bucket = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const hit = monthlyRows.rows.find((row) => row.bucket === bucket)
    monthly.push({
      label: bucket,
      sales: hit ? Number(hit.sales) : 0,
      orders: hit ? Number(hit.orders) : 0,
    })
  }

  const s = stock.rows[0]
  return {
    todaySales: Number(today.rows[0].sales),
    todayOrders: Number(today.rows[0].orders),
    pendingOrders: Number(pending.rows[0].n),
    lowStock: Number(s.low),
    outOfStock: Number(s.out),
    inStock: Number(s.in_stock),
    totalProducts: Number(s.total),
    charts: { daily, weekly, monthly },
  }
}

export async function listCustomers() {
  const registered = await query(
    `SELECT u.id, u.name, u.phone,
            COUNT(o.id) FILTER (WHERE o.status <> 'cancelled')::int AS order_count,
            COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0)::float AS total_spent,
            MAX(o.created_at) AS last_order_at,
            (
              SELECT o2.id FROM orders o2
              WHERE o2.user_id = u.id
              ORDER BY o2.created_at DESC LIMIT 1
            ) AS recent_order_id,
            (
              SELECT o2.total FROM orders o2
              WHERE o2.user_id = u.id
              ORDER BY o2.created_at DESC LIMIT 1
            ) AS recent_total
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role = 'customer'
     GROUP BY u.id
     ORDER BY total_spent DESC, u.created_at DESC`,
  )

  const guests = await query(
    `SELECT customer_name AS name, customer_phone AS phone,
            COUNT(*) FILTER (WHERE status <> 'cancelled')::int AS order_count,
            COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0)::float AS total_spent,
            MAX(created_at) AS last_order_at,
            (ARRAY_AGG(id ORDER BY created_at DESC))[1] AS recent_order_id,
            (ARRAY_AGG(total ORDER BY created_at DESC))[1] AS recent_total
     FROM orders
     WHERE user_id IS NULL
     GROUP BY customer_phone, customer_name
     ORDER BY total_spent DESC`,
  )

  const knownPhones = new Set(registered.rows.map((row) => row.phone))
  const guestRows = guests.rows.filter((row) => !knownPhones.has(row.phone))

  const mapRow = (row, guest) => ({
    id: row.id || `guest:${row.phone}`,
    name: row.name,
    phone: row.phone,
    guest,
    orderCount: Number(row.order_count || 0),
    totalSpent: Number(row.total_spent || 0),
    recentOrder: row.recent_order_id
      ? {
          id: row.recent_order_id,
          total: Number(row.recent_total || 0),
          at: row.last_order_at instanceof Date ? row.last_order_at.toISOString() : row.last_order_at,
        }
      : null,
  })

  return [
    ...registered.rows.map((row) => mapRow(row, false)),
    ...guestRows.map((row) => mapRow(row, true)),
  ]
}

export async function getSettings() {
  const { rows } = await query('SELECT key, value FROM settings')
  const data = Object.fromEntries(rows.map((row) => [row.key, row.value]))
  return {
    storeName: data.storeName || 'Yalamber Mini Mart',
    tagline: data.tagline || 'Your Everyday Store.',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    hoursWeekday: data.hoursWeekday || '',
    hoursSaturday: data.hoursSaturday || '',
    deliveryFee: Number(data.deliveryFee ?? env.deliveryFee),
    freeDeliveryOver: Number(data.freeDeliveryOver ?? env.freeDeliveryOver),
  }
}

const SETTING_KEYS = [
  'storeName',
  'tagline',
  'address',
  'phone',
  'email',
  'hoursWeekday',
  'hoursSaturday',
  'deliveryFee',
  'freeDeliveryOver',
]

export async function updateSettings(body) {
  if (!body || typeof body !== 'object') throw ApiError.badRequest('JSON body required')
  for (const key of SETTING_KEYS) {
    if (body[key] == null) continue
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, String(body[key])],
    )
  }
  return getSettings()
}
