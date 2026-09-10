import fs from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import { env } from './config/env.js'
import { optionalAuth } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import routes from './routes/index.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('etag', false)
  app.set('trust proxy', true)

  app.use((req, res, next) => {
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
    res.setHeader('Cache-Control', 'no-store')
    res.removeHeader('X-Frame-Options')
    res.removeHeader('Content-Security-Policy')
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })
  app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Auth-Token'],
  }))
  app.use(cookieParser())
  app.use(express.json({ limit: '256kb' }))
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`)
      }
    })
    next()
  })

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: { ok: true, service: 'yalamber-api', time: new Date().toISOString() },
    })
  })

  app.use('/api', optionalAuth, routes)

  if (env.serveClient) {
    const dist = env.clientDist
    if (fs.existsSync(dist)) {
      app.use(express.static(dist, { index: false, fallthrough: true }))
      app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        if (req.path.startsWith('/api')) return next()
        const index = path.join(dist, 'index.html')
        if (!fs.existsSync(index)) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.sendFile(index)
      })
    }
  }

  app.use(notFound)
  app.use(errorHandler)
  return app
}
