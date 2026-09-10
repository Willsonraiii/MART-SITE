import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { publicUser } from '../db/map.js'
import { findUserById } from '../services/userService.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' })
}

function hostnameOf(req) {
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim().toLowerCase()
  return host.split(':')[0]
}

function isHttps(req) {
  if (String(process.env.FORCE_SECURE_COOKIES || '').toLowerCase() === 'true') return true
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim().toLowerCase()
  if (proto === 'https') return true
  const origin = req.get('origin') || ''
  const referer = req.get('referer') || ''
  if (origin.startsWith('https:') || referer.startsWith('https:')) return true
  const hostname = hostnameOf(req)
  const xfHost = (req.get('x-forwarded-host') || '').toLowerCase()
  if (hostname.includes('e2b.app') || xfHost.includes('e2b.app')) return true
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1') {
    return false
  }
  return true
}

function readToken(req) {
  const header = req.get('authorization') || ''
  if (header.length > 7 && header.slice(0, 7).toLowerCase() === 'bearer ') {
    const token = header.slice(7).trim()
    if (token) return token
  }
  const x = (req.get('x-auth-token') || '').trim()
  if (x) return x
  return req.cookies?.[env.cookieName] || null
}

function cookieOptions(req) {
  const https = isHttps(req)
  return {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: https ? 'none' : 'lax',
    secure: https,
    partitioned: https,
  }
}

export function setAuthCookie(req, res, token) {
  res.cookie(env.cookieName, token, cookieOptions(req))
}

export function clearAuthCookie(req, res) {
  const opts = cookieOptions(req)
  delete opts.maxAge
  res.clearCookie(env.cookieName, opts)
}

export async function optionalAuth(req, res, next) {
  try {
    const token = readToken(req)
    if (!token) {
      req.user = null
      return next()
    }
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await findUserById(payload.sub)
    req.user = user ? publicUser(user) : null
    next()
  } catch {
    req.user = null
    next()
  }
}

export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {
    if (!req.user) next(ApiError.unauthorized())
    else next()
  })
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, (err) => {
    if (err) {
      console.log(`admin 401 ${req.method} ${req.originalUrl} cookie=${Boolean(req.cookies?.[env.cookieName])} auth=${Boolean(req.get('authorization'))} x=${Boolean(req.get('x-auth-token'))}`)
      return next(err)
    }
    if (req.user.role !== 'admin') next(ApiError.forbidden('Admin access only.'))
    else next()
  })
}
