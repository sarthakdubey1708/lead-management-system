import { ApiError, validationError } from '../utils/api-error.js'

export function notFound(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', 'The requested API route was not found.'))
}

export function handleError(error, req, res, next) {
  if (res.headersSent) return next(error)

  let apiError = error
  if (['charset.unsupported', 'encoding.unsupported'].includes(error.type)) {
    apiError = new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the request body as UTF-8 JSON.')
  } else if (['entity.parse.failed', 'request.size.invalid'].includes(error.type) ||
             (error instanceof URIError && error.status === 400)) {
    apiError = validationError()
  } else if (error.type === 'entity.too.large') {
    apiError = new ApiError(400, 'VALIDATION_ERROR', 'The request body exceeds 16 KB.')
  } else if (error.name === 'ValidationError' && error.errors) {
    const fields = Object.fromEntries(Object.keys(error.errors).map((key) => [key, 'Enter a valid value.']))
    apiError = validationError(fields)
  } else if (!(error instanceof ApiError)) {
    console.error('Unexpected API error:', error.name)
    apiError = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.')
  }

  const { status, code, message, fields } = apiError
  res.status(status).json({ success: false, error: { code, message, fields } })
}
