import { LEAD_FIELDS, LEAD_SOURCES, LEAD_STATUSES, LEAD_TEXT_LIMITS } from '../constants/leads.js'
import { ApiError, unknownFields, validationError } from '../utils/api-error.js'
import { isLeadEmail, isLeadPhone } from '../utils/lead-format.js'

function textError(field, value) {
  const [min, max] = LEAD_TEXT_LIMITS[field]
  if (field === 'email' && (value.length > max || !isLeadEmail(value))) {
    return 'Enter a valid email address.'
  }
  if (field === 'phone' && (value.length > max || !isLeadPhone(value))) {
    return 'Enter 7–15 digits with an optional leading +, spaces, parentheses or hyphens.'
  }
  if (value.length < min || value.length > max) {
    return `Enter between ${min} and ${max} characters.`
  }
}

export function validateLeadBody(req, res, next) {
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError({ body: 'Send a JSON object.' })
  }

  const fields = unknownFields(body, LEAD_FIELDS, 'This field is not allowed.')
  const lead = {}
  for (const field of LEAD_FIELDS) {
    if (field === 'leadStatus' && req.method === 'POST' && !Object.hasOwn(body, field)) {
      continue
    }
    const value = Object.hasOwn(body, field) ? body[field] : undefined
    if (typeof value !== 'string') {
      fields[field] = value === undefined ? 'This field is required.' : 'Enter a string.'
      continue
    }

    if (field === 'leadSource' || field === 'leadStatus') {
      const choices = field === 'leadSource' ? LEAD_SOURCES : LEAD_STATUSES
      if (choices.includes(value)) {
        lead[field] = value
      } else {
        fields[field] = `Choose a valid ${field === 'leadSource' ? 'lead source' : 'lead status'}.`
      }
      continue
    }

    const trimmed = value.trim()
    const normalized = field === 'email' ? trimmed.toLowerCase() : trimmed
    const error = textError(field, normalized)
    if (error) {
      fields[field] = error
    } else {
      lead[field] = normalized
    }
  }

  if (Object.keys(fields).length) throw validationError(fields)
  res.locals.lead = lead
  next()
}

export function validateId(req, res, next) {
  if (req.params.id.length !== 24 || !/^[a-f\d]{24}$/i.test(req.params.id)) {
    throw new ApiError(400, 'INVALID_ID', 'Enter a valid lead ID.')
  }
  next()
}
