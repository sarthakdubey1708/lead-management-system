import express from 'express'
import { ApiError } from '../utils/api-error.js'

export function requireJson(req, res, next) {
  if (!req.is('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the request body as application/json.')
  }
  next()
}

export const parseJson = express.json({ limit: '16kb' })
