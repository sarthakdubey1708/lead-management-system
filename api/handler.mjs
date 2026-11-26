import { createApp } from '../server/app.js'
import { createDatabaseConnector } from '../server/config/database.js'
import { serverConfig } from '../server/config/env.js'

const { uri, ...appOptions } = serverConfig({ ...process.env, NODE_ENV: 'production' })

export default createApp({
  ...appOptions,
  // Vercel sets the forwarded client IP. Trust only the hop immediately in front of Express.
  trustProxy: 1,
  ensureDatabase: createDatabaseConnector(uri),
})
