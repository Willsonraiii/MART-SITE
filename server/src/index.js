import { assertEnv, env } from './config/env.js'
import { createApp } from './app.js'
import { initDb } from './db/migrate.js'

assertEnv()
await initDb()

const app = createApp()
const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Yalamber API on 0.0.0.0:${env.port}`)
  if (env.serveClient) console.log(`Serving client from ${env.clientDist}`)
})

server.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
