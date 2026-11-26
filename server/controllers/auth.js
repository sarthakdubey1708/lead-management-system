import bcrypt from 'bcryptjs'
import { ADMIN_ROLE, SESSION_COOKIE, SESSION_SECONDS } from '../constants/auth.js'
import { User } from '../models/user.js'
import { ApiError } from '../utils/api-error.js'
import { publicUser, signSession } from '../utils/session.js'

// Well-formed cost-12 dummy hash keeps unknown users on the bcrypt verification path.
const dummyHash = '$2b$12$.....................................................'

export function login(jwtSecret, cookieOptions, ensureDatabase) {
  return async (req, res) => {
    const { email, password } = res.locals.credentials
    await ensureDatabase?.()
    const user = await User.findOne({ email, role: ADMIN_ROLE }).select('+passwordHash').lean()
    const matches = await bcrypt.compare(password, user?.passwordHash ?? dummyHash)
    if (!user || !matches) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
    }

    const token = signSession(user._id, jwtSecret)
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_SECONDS * 1000 })
    res.json({ success: true, data: { user: publicUser(user) } })
  }
}

export function me(req, res) {
  res.json({ success: true, data: { user: res.locals.user } })
}

export function logout(cookieOptions) {
  return (req, res) => {
    res.clearCookie(SESSION_COOKIE, cookieOptions)
    res.json({ success: true, data: null })
  }
}
