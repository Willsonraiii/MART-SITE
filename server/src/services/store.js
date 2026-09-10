import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '../config/env.js'
import { seedDatabase } from './seed.js'

let memory = { products: [], categories: [], offers: [], orders: [] }
let writeChain = Promise.resolve()

async function readFileStore() {
  try {
    const raw = await fs.readFile(env.databaseFile, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      offers: Array.isArray(parsed.offers) ? parsed.offers : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    }
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function writeFileStore(next) {
  await fs.mkdir(path.dirname(env.databaseFile), { recursive: true })
  const tmp = `${env.databaseFile}.tmp`
  await fs.writeFile(tmp, JSON.stringify(next, null, 2))
  await fs.rename(tmp, env.databaseFile)
}

export async function initStore() {
  const existing = await readFileStore()
  if (!existing || existing.products.length === 0) {
    const seeded = await seedDatabase()
    memory = {
      products: seeded.products,
      categories: seeded.categories,
      offers: seeded.offers,
      orders: existing?.orders || [],
    }
    await writeFileStore(memory)
    return memory
  }
  memory = existing
  return memory
}

export function getState() {
  return memory
}

export async function mutate(updater) {
  const run = async () => {
    const next = await updater({
      products: memory.products,
      categories: memory.categories,
      offers: memory.offers,
      orders: memory.orders,
    })
    memory = {
      products: next.products,
      categories: next.categories,
      offers: next.offers,
      orders: next.orders,
    }
    await writeFileStore(memory)
    return memory
  }
  const pending = writeChain.then(run, run)
  writeChain = pending.then(
    () => undefined,
    () => undefined,
  )
  return pending
}
