import jwt from 'jsonwebtoken'
import { SESSION_SECONDS } from '../constants/auth.js'

const algorithm = 'HS256'

export function signSession(userId, secret) {
  return jwt.sign({}, secret, { algorithm, subject: String(userId), expiresIn: SESSION_SECONDS })
}

export function sessionUserId(token, secret) {
  try {
    const claims = jwt.verify(token, secret, { algorithms: [algorithm], maxAge: SESSION_SECONDS })
    if (claims && typeof claims.sub === 'string' && claims.sub.length === 24 &&
        !/[^a-f\d]/i.test(claims.sub) && Number.isSafeInteger(claims.exp)) {
      return claims.sub
    }
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError)) throw error
  }
  return null
}

export function sessionCookieOptions(appOrigin) {
  return { httpOnly: true, sameSite: 'strict', path: '/api', secure: new URL(appOrigin).protocol === 'https:' }
}

export function publicUser({ _id, name, email, role }) {
  return { _id, name, email, role }
}
