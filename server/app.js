import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import { DEFAULT_LOGIN_LIMIT } from './constants/auth.js'
import { requireAdmin } from './middleware/auth.js'
import { handleError, notFound } from './middleware/errors.js'
import { authRouter } from './routes/auth.js'
import { dashboardRouter } from './routes/dashboard.js'
import { leadRouter } from './routes/leads.js'

export function createApp({
  appOrigin,
  jwtSecret,
  loginLimit = DEFAULT_LOGIN_LIMIT,
  environment = 'development',
  trustProxy = environment === 'production' ? 'loopback' : false,
  ensureDatabase,
}) {
  const app = express()
  const authenticate = requireAdmin(jwtSecret, ensureDatabase)

  app.disable('x-powered-by')
  app.set('query parser', 'simple')
  app.set('trust proxy', trustProxy)
  const httpsOrigin = new URL(appOrigin).protocol === 'https:'
  app.use(helmet(httpsOrigin ? {} : { strictTransportSecurity: false }))
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.use('/api', cookieParser())

  app.use('/api/auth', authRouter({ appOrigin, jwtSecret, loginLimit, authenticate, ensureDatabase }))
  app.use('/api/leads', leadRouter(appOrigin, authenticate))
  app.use('/api/dashboard', dashboardRouter(authenticate))
  app.use(notFound)
  app.use(handleError)
  return app
}
