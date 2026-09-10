import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const serverRoot = path.resolve(__dirname, '../..')
export const repoRoot = path.resolve(serverRoot, '..')

dotenv.config({ path: path.join(serverRoot, '.env') })
dotenv.config({ path: path.join(repoRoot, '.env') })

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value == null || value === '') {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(required('PORT', '3001')),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  cookieName: process.env.COOKIE_NAME || 'ym_session',
  serveClient: String(process.env.SERVE_CLIENT || 'false') === 'true',
  clientDist: path.resolve(repoRoot, 'dist'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  freeDeliveryOver: Number(process.env.FREE_DELIVERY_OVER || 1000),
  deliveryFee: Number(process.env.DELIVERY_FEE || 50),
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminPhone: process.env.ADMIN_PHONE || '9800000000',
  adminName: process.env.ADMIN_NAME || 'Yalamber Admin',
}

export function assertEnv() {
  if (!env.databaseUrl.startsWith('postgres')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string')
  }
  if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be a strong value in production')
  }
}
