import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { seedDatabase } from '../services/seed.js'
import { normalizePhone } from '../utils/phone.js'
import { pool, query } from './pool.js'

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql')

async function waitForDb() {
  let last
  for (let i = 0; i < 12; i += 1) {
    try {
      await query('SELECT 1')
      return
    } catch (err) {
      last = err
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw last || new Error('PostgreSQL is not reachable')
}

export async function initDb() {
  await waitForDb()
  const sql = await fs.readFile(schemaPath, 'utf8')
  await query(sql)

  const { rows: catCount } = await query('SELECT COUNT(*)::int AS n FROM categories')
  if (!catCount[0].n) {
    const seeded = await seedDatabase()
    for (const [i, cat] of seeded.categories.entries()) {
      await query(
        `INSERT INTO categories (id, name, tone, sort_order) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.tone, i],
      )
    }
    for (const p of seeded.products) {
      await query(
        `INSERT INTO products (
          id, name, brand, category_id, description, price, original_price, discount,
          stock, stock_label, unit, weight, image, featured, created_at, popular,
          keywords, model, model_color, note
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        ) ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.name,
          p.brand,
          p.category,
          p.description,
          p.price,
          p.originalPrice,
          p.discount,
          p.stock,
          p.stockLabel,
          p.unit,
          p.weight,
          p.image,
          p.featured,
          p.createdAt,
          p.popular,
          p.keywords,
          p.model,
          p.modelColor,
          p.note,
        ],
      )
    }
    for (const offer of seeded.offers) {
      await query(
        `INSERT INTO offers (id, kicker, title, tag, detail, cta, to_path, theme)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [offer.id, offer.kicker, offer.title, offer.tag, offer.detail, offer.cta, offer.to, offer.theme],
      )
    }
  }

  const { rows: admins } = await query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`)
  if (!admins.length && env.adminEmail && env.adminPassword) {
    const hash = await bcrypt.hash(env.adminPassword, 12)
    await query(
      `INSERT INTO users (name, phone, email, password_hash, role, address, city)
       VALUES ($1,$2,$3,$4,'admin',$5,$6)
       ON CONFLICT (email) DO NOTHING`,
      [
        env.adminName,
        normalizePhone(env.adminPhone),
        env.adminEmail.toLowerCase(),
        hash,
        'Shop 12, New Baneshwor Chowk',
        'New Baneshwor',
      ],
    )
  }

  await query(`
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'banner';
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS percent INT;
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS buy_qty INT;
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS get_qty INT;
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS category_id TEXT;
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS product_id TEXT;
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
  `)
  await query(`
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  `)
  await query(`
    CREATE INDEX IF NOT EXISTS products_price_idx ON products (price);
    CREATE INDEX IF NOT EXISTS products_featured_idx ON products (featured) WHERE featured IS TRUE;
    CREATE INDEX IF NOT EXISTS products_stock_idx ON products (stock);
  `)

  const defaults = {
    storeName: 'Yalamber Mini Mart',
    tagline: 'Your Everyday Store.',
    address: 'Shop 12, New Baneshwor Chowk, Kathmandu 44600',
    phone: '+977 1-5901840',
    email: 'hello@yalambermart.com.np',
    hoursWeekday: 'Sun – Fri · 7:00 AM – 9:00 PM',
    hoursSaturday: 'Saturday · 8:00 AM – 8:00 PM',
    deliveryFee: String(env.deliveryFee),
    freeDeliveryOver: String(env.freeDeliveryOver),
  }
  for (const [key, value] of Object.entries(defaults)) {
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value],
    )
  }

  const { rows: n } = await query('SELECT COUNT(*)::int AS n FROM products')
  console.log(`Postgres ready · ${n[0].n} products`)
}

export async function closeDb() {
  await pool.end()
}
