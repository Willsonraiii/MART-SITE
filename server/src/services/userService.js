import bcrypt from 'bcryptjs'
import { query } from '../db/pool.js'
import { publicUser } from '../db/map.js'
import { ApiError } from '../utils/ApiError.js'
import { normalizePhone, PHONE_RE } from '../utils/phone.js'

const NAME = /^[\p{L}\s.'-]+$/u
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function findUserById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id])
  return rows[0] || null
}

export async function findUserByEmailOrPhone(login) {
  const value = String(login || '').trim().toLowerCase()
  const phone = normalizePhone(login)
  const { rows } = await query(
    `SELECT * FROM users WHERE lower(email) = $1 OR phone = $2 LIMIT 1`,
    [value, phone],
  )
  return rows[0] || null
}

function validateRegister(body) {
  const errors = {}
  const name = String(body?.name || body?.fullName || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const phone = normalizePhone(body?.phone)
  const password = String(body?.password || '')
  const address = String(body?.address || '').trim()
  const city = String(body?.city || 'New Baneshwor').trim() || 'New Baneshwor'
  const landmark = String(body?.landmark || '').trim()

  if (!name || name.length < 2) errors.name = 'Enter your full name.'
  else if (!NAME.test(name)) errors.name = 'Use letters only in the name.'
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.'
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid Nepal mobile number.'
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (Object.keys(errors).length) throw ApiError.unprocessable('Please check your details.', errors)

  return { name, email, phone, password, address, city, landmark }
}

function conflictFromPg(err) {
  const detail = String(err?.detail || err?.message || '')
  const details = {}
  if (detail.includes('(email)')) details.email = 'That email is already on the books.'
  if (detail.includes('(phone)')) details.phone = 'That phone is already registered.'
  throw ApiError.conflict('An account already exists.', Object.keys(details).length ? details : undefined)
}

export async function registerUser(body) {
  const data = validateRegister(body)
  const existing = await query(
    `SELECT email, phone FROM users WHERE lower(email) = $1 OR phone = $2`,
    [data.email, data.phone],
  )
  if (existing.rows.length) {
    const details = {}
    for (const row of existing.rows) {
      if (row.email.toLowerCase() === data.email) details.email = 'That email is already on the books.'
      if (row.phone === data.phone) details.phone = 'That phone is already registered.'
    }
    throw ApiError.conflict('An account already exists.', details)
  }
  const hash = await bcrypt.hash(data.password, 12)
  try {
    const { rows } = await query(
      `INSERT INTO users (name, phone, email, password_hash, role, address, city, landmark)
       VALUES ($1,$2,$3,$4,'customer',$5,$6,$7)
       RETURNING *`,
      [data.name, data.phone, data.email, hash, data.address, data.city, data.landmark],
    )
    return publicUser(rows[0])
  } catch (err) {
    if (err.code === '23505') conflictFromPg(err)
    throw err
  }
}

export async function authenticateUser(login, password) {
  const user = await findUserByEmailOrPhone(login)
  if (!user) throw ApiError.unauthorized('Email/phone or password is wrong.')
  const ok = await bcrypt.compare(String(password || ''), user.password_hash)
  if (!ok) throw ApiError.unauthorized('Email/phone or password is wrong.')
  return publicUser(user)
}

export async function updateProfile(userId, body) {
  const current = await findUserById(userId)
  if (!current) throw ApiError.notFound('Account not found.')
  const errors = {}
  const name = String(body?.name ?? current.name).trim()
  const phone = normalizePhone(body?.phone ?? current.phone)
  const address = String(body?.address ?? current.address).trim()
  const city = String(body?.city ?? current.city).trim() || 'New Baneshwor'
  const landmark = String(body?.landmark ?? current.landmark).trim()

  if (!name || name.length < 2) errors.name = 'Enter your full name.'
  else if (!NAME.test(name)) errors.name = 'Use letters only in the name.'
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid Nepal mobile number.'
  if (Object.keys(errors).length) throw ApiError.unprocessable('Please check your details.', errors)

  const clash = await query(
    `SELECT id FROM users WHERE phone = $1 AND id <> $2 LIMIT 1`,
    [phone, userId],
  )
  if (clash.rows.length) throw ApiError.conflict('That phone is already registered.', { phone: 'Taken.' })

  try {
    const { rows } = await query(
      `UPDATE users SET name = $1, phone = $2, address = $3, city = $4, landmark = $5
       WHERE id = $6 RETURNING *`,
      [name, phone, address, city, landmark, userId],
    )
    return publicUser(rows[0])
  } catch (err) {
    if (err.code === '23505') conflictFromPg(err)
    throw err
  }
}
