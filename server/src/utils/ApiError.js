export class ApiError extends Error {
  constructor(status, message, details = null, code = 'REQUEST_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.code = code
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details, 'BAD_REQUEST')
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message, null, 'NOT_FOUND')
  }

  static unprocessable(message, details) {
    return new ApiError(422, message, details, 'VALIDATION_ERROR')
  }

  static unauthorized(message = 'Please sign in.') {
    return new ApiError(401, message, null, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Not allowed.') {
    return new ApiError(403, message, null, 'FORBIDDEN')
  }

  static conflict(message, details) {
    return new ApiError(409, message, details, 'CONFLICT')
  }
}
