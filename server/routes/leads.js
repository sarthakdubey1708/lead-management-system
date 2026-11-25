import { Router } from 'express'
import { createLead, deleteLead, getLead, listLeads, updateLead } from '../controllers/leads.js'
import { parseJson, requireJson } from '../middleware/json-body.js'
import { requireOrigin } from '../middleware/require-origin.js'
import { validateId, validateLeadBody } from '../validators/leads.js'
import { validateListQuery } from '../validators/lead-query.js'

export function leadRouter(appOrigin, authenticate) {
  const router = Router()
  const origin = requireOrigin(appOrigin)

  router.get('/', authenticate, validateListQuery, listLeads)
  router.post('/', authenticate, origin, requireJson, parseJson, validateLeadBody, createLead)
  router.get('/:id', authenticate, validateId, getLead)
  router.put('/:id', authenticate, origin, validateId, requireJson, parseJson, validateLeadBody, updateLead)
  router.delete('/:id', authenticate, origin, validateId, deleteLead)
  return router
}
