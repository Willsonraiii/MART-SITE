export function mapProduct(row) {
  if (!row) return null
  const created = row.created_at
  const createdAt =
    created instanceof Date ? created.toISOString().slice(0, 10) : created || '2026-06-15'
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || '',
    category: row.category_id,
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    discount: Number(row.discount || 0),
    stock: row.stock,
    stockLabel: row.stock_label,
    unit: row.unit || row.weight || '',
    weight: row.weight || row.unit || '',
    image: row.image,
    featured: Boolean(row.featured),
    createdAt,
    popular: Number(row.popular ?? 50),
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    model: row.model || null,
    modelColor: row.model_color || '#c45d2c',
    note: row.note || '',
  }
}

export function mapCategory(row, count = 0) {
  return {
    id: row.id,
    name: row.name,
    tone: row.tone || 'leaf',
    sortOrder: Number(row.sort_order || 0),
    count: Number(count),
  }
}

export function mapOffer(row) {
  return {
    id: row.id,
    kicker: row.kicker,
    title: row.title,
    tag: row.tag,
    detail: row.detail,
    cta: row.cta,
    to: row.to_path || '/shop',
    theme: row.theme || 'leaf',
    kind: row.kind || 'banner',
    percent: row.percent != null ? Number(row.percent) : null,
    amount: row.amount != null ? Number(row.amount) : null,
    buyQty: row.buy_qty != null ? Number(row.buy_qty) : null,
    getQty: row.get_qty != null ? Number(row.get_qty) : null,
    categoryId: row.category_id || null,
    productId: row.product_id || null,
    active: row.active !== false,
  }
}

export function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    address: row.address || '',
    city: row.city || 'New Baneshwor',
    landmark: row.landmark || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export function mapOrderItem(row) {
  return {
    id: row.product_id,
    name: row.name,
    brand: row.brand || '',
    image: row.image,
    weight: row.weight || '',
    qty: Number(row.quantity),
    price: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  }
}

export function mapOrder(order, items = []) {
  const lines = items.map(mapOrderItem)
  return {
    id: order.id,
    customer: {
      fullName: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email || '',
      address: order.address_line,
      landmark: order.landmark || '',
      city: order.city || '',
      notes: order.notes || '',
    },
    items: lines,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    deliveryFee: Number(order.delivery_fee),
    total: Number(order.total),
    address: {
      line: order.address_line,
      landmark: order.landmark || '',
      city: order.city || '',
      notes: order.notes || '',
    },
    paymentMethod: order.payment_method,
    status: order.status,
    createdAt: order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at,
    eta: order.eta || 'Today, 45–90 minutes',
    userId: order.user_id || null,
  }
}
