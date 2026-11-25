import { Router } from 'express'
import { getSummary } from '../controllers/dashboard.js'
import { validateSummaryQuery } from '../validators/lead-query.js'

export function dashboardRouter(authenticate) {
  const router = Router()
  router.get('/summary', authenticate, validateSummaryQuery, getSummary)
  return router
}
