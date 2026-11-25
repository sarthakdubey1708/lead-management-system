import { existsSync } from 'node:fs'
import { DEFAULT_LOGIN_LIMIT } from '../constants/auth.js'

const envFile = new URL('../.env', import.meta.url)
const loopbackHosts = ['localhost', '127.0.0.1', '[::1]']

export function loadEnvironment() {
  if (existsSync(envFile)) process.loadEnvFile(envFile)
}

export function mongoUri(env = process.env) {
  const uri = env.MONGODB_URI
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('Set MONGODB_URI in server/.env or in your environment.')
  }
  return uri
}

export function readJwtSecret(env = process.env) {
  const secret = env.JWT_SECRET
  if (typeof secret !== 'string' || secret.length !== 64 || /[^a-f\d]/i.test(secret)) {
    throw new Error('Set JWT_SECRET to a securely generated 64-character hex value in server/.env.')
  }
  return secret
}

function positiveInteger(value, key, max) {
  const number = Number(value)
  if (!value || /\D/.test(value) || !Number.isSafeInteger(number) || number < 1 || number > max) {
    throw new Error(`${key} must be an integer from 1 to ${max}.`)
  }
  return number
}

export function serverConfig(env = process.env) {
  const environment = env.NODE_ENV ?? 'development'
  if (environment !== 'development' && environment !== 'production') {
    throw new Error('NODE_ENV must be development or production when running the API.')
  }

  const port = positiveInteger(env.PORT ?? '5000', 'PORT', 65535)
  const appOrigin = env.APP_ORIGIN ?? (environment === 'development' ? 'http://localhost:5173' : '')
  const url = URL.canParse(appOrigin) ? new URL(appOrigin) : null
  const validOrigin = url && url.origin === appOrigin && (
    url.protocol === 'https:' ||
    (environment === 'development' && url.protocol === 'http:' && loopbackHosts.includes(url.hostname))
  )
  if (!validOrigin) {
    throw new Error('APP_ORIGIN must be an exact HTTPS origin or a local HTTP origin in development.')
  }

  const loginLimit = positiveInteger(env.LOGIN_RATE_LIMIT ?? String(DEFAULT_LOGIN_LIMIT), 'LOGIN_RATE_LIMIT', Number.MAX_SAFE_INTEGER)
  return { port, appOrigin, uri: mongoUri(env), jwtSecret: readJwtSecret(env), environment, loginLimit }
}
