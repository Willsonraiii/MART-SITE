import { ApiError } from '../utils/ApiError.js'

export function notFound(req, res, next) {
  if (req.path.startsWith('/api')) {
    next(ApiError.notFound(`No route for ${req.method} ${req.path}`))
    return
  }
  res.status(404).json({
    success: false,
    error: { message: 'Not found', code: 'NOT_FOUND' },
  })
}
