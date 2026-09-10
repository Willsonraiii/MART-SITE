import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertEnv } from './server/src/config/env.js'
import { createApp } from './server/src/app.js'
import { initDb } from './server/src/db/migrate.js'

assertEnv()
await initDb()
const api = createApp()

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const port = Number(process.env.CLIENT_PORT || 5173)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

function baseHeaders(req, res) {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Auth-Token')
  res.setHeader('Content-Security-Policy', 'frame-ancestors *')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.removeHeader('X-Frame-Options')
}

function cacheFor(urlPath, ext) {
  if (urlPath.startsWith('/api')) return 'no-store'
  if (ext === '.html' || urlPath === '/') return 'no-store'
  if (/\/assets\/[^/]+\.(js|css)$/.test(urlPath)) return 'public, max-age=31536000, immutable'
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.woff', '.woff2', '.ico'].includes(ext)) {
    return 'public, max-age=86400'
  }
  return 'no-store'
}

const server = http.createServer((req, res) => {
  baseHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store')
    api(req, res)
    return
  }

  if (urlPath.startsWith('/uploads/')) {
    const uploadRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public/uploads')
    const uploadPath = path.normalize(path.join(uploadRoot, urlPath.slice('/uploads/'.length)))
    if (uploadPath.startsWith(uploadRoot) && fs.existsSync(uploadPath) && fs.statSync(uploadPath).isFile()) {
      const ext = path.extname(uploadPath)
      const type = mime[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', type)
      res.setHeader('Cache-Control', 'public, max-age=86400')
      fs.createReadStream(uploadPath).pipe(res)
      return
    }
  }

  let filePath = path.normalize(path.join(root, urlPath === '/' ? 'index.html' : urlPath))
  if (!filePath.startsWith(root)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  if (!exists) filePath = path.join(root, 'index.html')

  const ext = path.extname(filePath)
  const type = mime[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', cacheFor(exists ? urlPath : '/', ext))
  fs.createReadStream(filePath).pipe(res)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Yalamber Mini Mart on 0.0.0.0:${port}`)
})
