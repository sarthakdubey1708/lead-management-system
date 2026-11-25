import { MAX_PASSWORD_BYTES } from '../constants/auth.js'
import { unknownFields, validationError } from '../utils/api-error.js'
import { isLeadEmail } from '../utils/lead-format.js'

function normalizeEmail(value) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && isLeadEmail(email) ? email : null
}

function validPassword(value) {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES
}

export function validateLogin(req, res, next) {
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError({ body: 'Send a JSON object.' })
  }

  const fields = unknownFields(body, ['email', 'password'], 'This field is not allowed.')
  const email = normalizeEmail(body.email)
  if (!email) fields.email = 'Enter a valid email address.'
  if (!validPassword(body.password)) fields.password = 'Enter a password up to 72 UTF-8 bytes.'

  if (Object.keys(fields).length) throw validationError(fields)
  res.locals.credentials = { email, password: body.password }
  next()
}

export function adminSeedConfig(env = process.env) {
  const name = env.ADMIN_NAME?.trim()
  const email = normalizeEmail(env.ADMIN_EMAIL)
  const password = env.ADMIN_PASSWORD

  if (!name) throw new Error('Set ADMIN_NAME in server/.env.')
  if (!email) throw new Error('Set ADMIN_EMAIL to a valid email address in server/.env.')
  if (!validPassword(password) || [...password].length < 12 ||
      password.trim() === 'replace_with_a_strong_private_password') {
    throw new Error('Set ADMIN_PASSWORD to a private password with at least 12 characters and at most 72 UTF-8 bytes.')
  }
  return { name, email, password }
}
