import { ADMIN_ROLE, SESSION_COOKIE } from '../constants/auth.js'
import { User } from '../models/user.js'
import { ApiError } from '../utils/api-error.js'
import { publicUser, sessionUserId } from '../utils/session.js'

export function requireAdmin(jwtSecret) {
  return async (req, res, next) => {
    const token = req.cookies[SESSION_COOKIE]
    const userId = typeof token === 'string' ? sessionUserId(token, jwtSecret) : null
    const user = userId && await User.findOne({ _id: userId, role: ADMIN_ROLE }).lean()
    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in to continue.')
    }

    res.locals.user = publicUser(user)
    next()
  }
}
