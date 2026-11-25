import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { LOGIN_WINDOW_MS } from '../constants/auth.js'
import { login, logout, me } from '../controllers/auth.js'
import { parseJson, requireJson } from '../middleware/json-body.js'
import { requireOrigin } from '../middleware/require-origin.js'
import { ApiError } from '../utils/api-error.js'
import { sessionCookieOptions } from '../utils/session.js'
import { validateLogin } from '../validators/auth.js'

export function authRouter({ appOrigin, jwtSecret, loginLimit, authenticate }) {
  const router = Router()
  const origin = requireOrigin(appOrigin)
  const cookieOptions = sessionCookieOptions(appOrigin)
  const limitLogin = rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    limit: loginLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new ApiError(429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.'))
    },
  })

  router.post('/login', origin, limitLogin, requireJson, parseJson, validateLogin, login(jwtSecret, cookieOptions))
  router.get('/me', authenticate, me)
  router.post('/logout', origin, logout(cookieOptions))
  return router
}
