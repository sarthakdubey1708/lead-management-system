import { once } from 'node:events'
import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { serverConfig, loadEnvironment } from './config/env.js'

async function start() {
  loadEnvironment()
  const { uri, port, ...appOptions } = serverConfig()

  try {
    await connectDatabase(uri)
  } catch (error) {
    throw new Error(`MongoDB connection failed (${error.name}). Check MONGODB_URI and that MongoDB is running.`, { cause: error })
  }

  const server = createApp(appOptions).listen(port, '127.0.0.1')
  await once(server, 'listening')
  console.log(`API listening on http://127.0.0.1:${port} (loopback)`)

  function stop() {
    server.close(async () => {
      await disconnectDatabase()
    })
  }

  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}

try {
  await start()
} catch (error) {
  console.error(error.message)
  await disconnectDatabase()
  process.exitCode = 1
}
