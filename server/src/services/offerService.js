import { mapOffer } from '../db/map.js'
import { query } from '../db/pool.js'
import { ApiError } from '../utils/ApiError.js'
import { slugify } from '../utils/id.js'

const KINDS = ['banner', 'percent', 'fixed', 'bogo']
const THEMES = ['leaf', 'coral', 'gold', 'rose', 'sky']

export async function listOffers() {
  const { rows } = await query(
    `SELECT * FROM offers WHERE COALESCE(active, true) = true ORDER BY id`,
  )
  return rows.map(mapOffer)
}

export async function listAllOffers() {
  const { rows } = await query('SELECT * FROM offers ORDER BY id')
  return rows.map(mapOffer)
}

function parseOffer(body, existing = {}) {
  const title = String(body?.title ?? existing.title ?? '').trim()
  if (!title) throw ApiError.unprocessable('Give the offer a title.', { title: 'Required.' })
  const kind = KINDS.includes(body?.kind) ? body.kind : existing.kind || 'banner'
  const percent = body?.percent != null ? Number(body.percent) : existing.percent
  const amount = body?.amount != null ? Number(body.amount) : existing.amount
  const buyQty = body?.buyQty != null ? Number(body.buyQty) : existing.buyQty
  const getQty = body?.getQty != null ? Number(body.getQty) : existing.getQty
  let tag = String(body?.tag ?? existing.tag ?? '').trim()
  if (!tag) {
    if (kind === 'percent' && percent) tag = `${percent}% OFF`
    else if (kind === 'fixed' && amount) tag = `Rs. ${amount} OFF`
    else if (kind === 'bogo' && buyQty && getQty) tag = `Buy ${buyQty} Get ${getQty}`
    else tag = 'Offer'
  }
  let toPath = String(body?.to ?? body?.toPath ?? existing.to ?? '/shop').trim() || '/shop'
  const categoryId = body?.categoryId ?? existing.categoryId ?? null
  if (categoryId && toPath === '/shop') toPath = `/shop?category=${categoryId}`
  return {
    kicker: String(body?.kicker ?? existing.kicker ?? "Today's Deal").trim(),
    title,
    tag,
    detail: String(body?.detail ?? existing.detail ?? '').trim(),
    cta: String(body?.cta ?? existing.cta ?? 'Shop now').trim(),
    toPath,
    theme: THEMES.includes(body?.theme) ? body.theme : existing.theme || 'leaf',
    kind,
    percent: kind === 'percent' ? percent || 0 : null,
    amount: kind === 'fixed' ? amount || 0 : null,
    buyQty: kind === 'bogo' ? buyQty || 2 : null,
    getQty: kind === 'bogo' ? getQty || 1 : null,
    categoryId: categoryId || null,
    productId: body?.productId ?? existing.productId ?? null,
    active: body?.active == null ? existing.active !== false : Boolean(body.active),
  }
}

export async function createOffer(body) {
  const data = parseOffer(body)
  let id = slugify(body?.id || data.title, 'deal')
  const clash = await query('SELECT 1 FROM offers WHERE id = $1', [id])
  if (clash.rows.length) id = `${id}-${Date.now().toString().slice(-4)}`
  const { rows } = await query(
    `INSERT INTO offers (
      id, kicker, title, tag, detail, cta, to_path, theme, kind, percent, amount,
      buy_qty, get_qty, category_id, product_id, active
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *`,
    [
      id, data.kicker, data.title, data.tag, data.detail, data.cta, data.toPath, data.theme,
      data.kind, data.percent, data.amount, data.buyQty, data.getQty, data.categoryId,
      data.productId, data.active,
    ],
  )
  return mapOffer(rows[0])
}

export async function updateOffer(id, body) {
  const { rows: current } = await query('SELECT * FROM offers WHERE id = $1', [id])
  if (!current[0]) throw ApiError.notFound('That offer is not on the board.')
  const data = parseOffer(body, mapOffer(current[0]))
  const { rows } = await query(
    `UPDATE offers SET
      kicker=$1, title=$2, tag=$3, detail=$4, cta=$5, to_path=$6, theme=$7, kind=$8,
      percent=$9, amount=$10, buy_qty=$11, get_qty=$12, category_id=$13, product_id=$14, active=$15
     WHERE id=$16 RETURNING *`,
    [
      data.kicker, data.title, data.tag, data.detail, data.cta, data.toPath, data.theme, data.kind,
      data.percent, data.amount, data.buyQty, data.getQty, data.categoryId, data.productId,
      data.active, id,
    ],
  )
  return mapOffer(rows[0])
}

export async function deleteOffer(id) {
  const { rows } = await query('DELETE FROM offers WHERE id = $1 RETURNING id', [id])
  if (!rows[0]) throw ApiError.notFound('That offer is not on the board.')
  return { id, deleted: true }
}
