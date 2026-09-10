import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { repoRoot } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export const uploadDir = path.join(repoRoot, 'public', 'uploads')
const distUploadDir = path.join(repoRoot, 'dist', 'uploads')

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg'
    const safe = ext.match(/^\.(jpe?g|png|webp|gif)$/) ? ext : '.jpg'
    cb(null, `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}${safe}`)
  },
})

function fileFilter(req, file, cb) {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(ApiError.unprocessable('Use a JPG, PNG, WebP or GIF image.', { image: 'Bad type.' }))
    return
  }
  cb(null, true)
}

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
})

export function publicUploadPath(filename) {
  try {
    fs.mkdirSync(distUploadDir, { recursive: true })
    fs.copyFileSync(path.join(uploadDir, filename), path.join(distUploadDir, filename))
  } catch {
    /* dist may not exist yet */
  }
  return `/uploads/${filename}`
}
