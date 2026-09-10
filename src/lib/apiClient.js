const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'ym_bearer'

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

let bearerToken = readStoredToken()

export function setBearerToken(token) {
  bearerToken = token || ''
  try {
    if (bearerToken) sessionStorage.setItem(TOKEN_KEY, bearerToken)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode */
  }
}

export function getBearerToken() {
  return bearerToken || readStoredToken()
}

export class ApiClientError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

function authHeaders() {
  const token = getBearerToken()
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
    'X-Auth-Token': token,
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json', ...authHeaders() }
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || json?.success === false) {
    throw new ApiClientError(
      json?.error?.message || `Request failed (${res.status})`,
      res.status,
      json,
    )
  }
  return json?.data
}

function qs(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '' || value === false) return
    sp.set(key, String(value))
  })
  const str = sp.toString()
  return str ? `?${str}` : ''
}

export function fetchProducts(params = {}, options) {
  return request(`/products${qs(params)}`, options)
}

export function fetchProduct(id, options) {
  return request(`/products/${encodeURIComponent(id)}`, options)
}

export function fetchCategories(options) {
  return request('/categories', options)
}

export function fetchCategory(id, options) {
  return request(`/categories/${encodeURIComponent(id)}`, options)
}

export function fetchOffers(options) {
  return request('/offers', options)
}

export function createOrder(payload, options) {
  return request('/orders', { method: 'POST', body: payload, ...options })
}

export function fetchOrder(id, options) {
  return request(`/orders/${encodeURIComponent(id)}`, options)
}

export function fetchMyOrders(options) {
  return request('/orders', options)
}

export function fetchMe(options) {
  return request('/auth/me', options)
}

export async function loginRequest(body, options) {
  const data = await request('/auth/login', { method: 'POST', body, ...options })
  setBearerToken(data?.token)
  return data
}

export async function registerRequest(body, options) {
  const data = await request('/auth/register', { method: 'POST', body, ...options })
  setBearerToken(data?.token)
  return data
}

export async function logoutRequest(options) {
  try {
    return await request('/auth/logout', { method: 'POST', body: {}, ...options })
  } finally {
    setBearerToken('')
  }
}

export function updateProfileRequest(body, options) {
  return request('/auth/profile', { method: 'PATCH', body, ...options })
}

export function fetchServerCart(options) {
  return request('/cart', options)
}

export function replaceServerCart(items, options) {
  return request('/cart', { method: 'PUT', body: { items }, ...options })
}

export function mergeServerCart(items, options) {
  return request('/cart/merge', { method: 'POST', body: { items }, ...options })
}

export function adminGet(path, options) {
  return request(`/admin${path}`, options)
}

export function adminSend(path, method, body, options) {
  return request(`/admin${path}`, { method, body, ...options })
}

export async function adminUpload(file) {
  const fd = new FormData()
  fd.append('image', file)
  const res = await fetch(`${BASE}/admin/uploads`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: fd,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || json?.success === false) {
    throw new ApiClientError(
      json?.error?.message || `Upload failed (${res.status})`,
      res.status,
      json,
    )
  }
  return json?.data
}

export function mapApiOrder(order) {
  if (!order) return null
  const items = order.items || []
  return {
    id: order.id,
    createdAt: order.createdAt,
    items,
    totals: {
      subtotal: order.subtotal,
      discount: order.discount,
      delivery: order.deliveryFee,
      total: order.total,
      count: items.reduce((sum, item) => sum + (item.qty || 0), 0),
    },
    customer: order.customer,
    payment: order.paymentMethod,
    eta: order.eta || 'Today, 45–90 minutes',
    status: order.status,
    address: order.address,
  }
}
