import mongoose from 'mongoose'

export function connectDatabase(uri, options = {}) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, ...options })
}

export function disconnectDatabase() {
  return mongoose.disconnect()
}
