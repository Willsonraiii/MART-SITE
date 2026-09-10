import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const port = Number(process.env.PORT || 5173)

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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

const apiOrigin = process.env.API_ORIGIN || 'http://127.0.0.1:3001'

function proxyApi(req, res) {
  const target = new URL(req.url || '/', apiOrigin)
  const headers = { ...req.headers, host: target.host }
  const proxyReq = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, {
        ...proxyRes.headers,
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      })
      proxyRes.pipe(res)
    },
  )
  proxyReq.on('error', () => {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ success: false, error: { message: 'API unavailable', code: 'BAD_GATEWAY' } }))
  })
  req.pipe(proxyReq)
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
  res.setHeader('Cache-Control', 'no-store')
  res.removeHeader('X-Frame-Options')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath.startsWith('/api')) {
    proxyApi(req, res)
    return
  }
  let filePath = path.normalize(path.join(root, urlPath))
  if (!filePath.startsWith(root)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  if (!exists) filePath = path.join(root, 'index.html')

  const type = mime[path.extname(filePath)] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  fs.createReadStream(filePath).pipe(res)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Yalamber Mini Mart preview on 0.0.0.0:${port}`)
})
