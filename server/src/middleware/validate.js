import { ApiError } from '../utils/ApiError.js'

export function parsePositiveInt(value, fallback) {
  if (value == null || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) {
    throw ApiError.badRequest('Expected a positive number')
  }
  return n
}

export function asBoolean(value) {
  return value === true || value === '1' || value === 'true'
}
