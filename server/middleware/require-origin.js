import { ApiError } from '../utils/api-error.js'

export function requireOrigin(appOrigin) {
  return (req, res, next) => {
    const origin = req.get('Origin')
    let requestOrigin = origin

    if (origin === undefined) {
      const referer = req.get('Referer')
      requestOrigin = URL.canParse(referer ?? '') ? new URL(referer).origin : undefined
    }

    if (!requestOrigin || requestOrigin !== appOrigin) {
      throw new ApiError(403, 'FORBIDDEN', 'Request origin is not allowed.')
    }
    next()
  }
}
