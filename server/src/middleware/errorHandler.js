import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err)
    return
  }

  if (err instanceof SyntaxError || err.type === 'entity.parse.failed') {
    res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON body', code: 'BAD_REQUEST' },
    })
    return
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(422).json({
      success: false,
      error: { message: 'That image is over 2 MB.', code: 'VALIDATION_ERROR' },
    })
    return
  }

  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      error: { message: 'That record is already on the books.', code: 'CONFLICT' },
    })
    return
  }

  const isApi = err instanceof ApiError
  const status = isApi ? err.status : err.status || err.statusCode || 500
  const payload = {
    success: false,
    error: {
      message: isApi || status < 500 ? err.message : 'Something went wrong on the server.',
      code: isApi ? err.code : 'INTERNAL_ERROR',
    },
  }
  if (isApi && err.details) payload.error.details = err.details
  if (env.nodeEnv !== 'production' && status >= 500) {
    payload.error.stack = err.stack
  }

  res.status(status).json(payload)
}
