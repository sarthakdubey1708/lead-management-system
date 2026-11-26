import mongoose from 'mongoose'

export function connectDatabase(uri, options = {}) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, ...options })
}

export function disconnectDatabase() {
  return mongoose.disconnect()
}

export function createDatabaseConnector(uri) {
  let connection

  return () => {
    // Share the initial connection attempt and let the driver recover later network interruptions.
    connection ??= connectDatabase(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      waitQueueTimeoutMS: 5_000,
      socketTimeoutMS: 10_000,
      autoCreate: false,
      autoIndex: false,
      bufferCommands: false,
    }).catch((error) => {
      connection = undefined
      throw error
    })
    return connection
  }
}
