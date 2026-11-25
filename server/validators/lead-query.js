import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/leads.js'
import { unknownFields, validationError } from '../utils/api-error.js'

const MAX_SEARCH_LENGTH = 100
const MAX_LIMIT = 100
const LIST_KEYS = ['search', 'status', 'source', 'page', 'limit']

function positiveInteger(query, field, fallback, max, fields) {
  const value = query[field]
  if (value === undefined) return fallback
  const number = typeof value === 'string' && value && !/\D/.test(value) ? Number(value) : NaN
  if (!Number.isSafeInteger(number) || number < 1 || number > max) {
    fields[field] = field === 'page' ? 'Enter a positive integer.' : `Enter an integer from 1 to ${max}.`
  }
  return number
}

export function validateListQuery(req, res, next) {
  const query = req.query
  const fields = unknownFields(query, LIST_KEYS, 'This query parameter is not allowed.')
  const { search = '', status = '', source = '' } = query
  if (typeof search !== 'string' || search.trim().length > MAX_SEARCH_LENGTH) {
    fields.search = `Enter one search term up to ${MAX_SEARCH_LENGTH} characters.`
  }
  if (status !== '' && !LEAD_STATUSES.includes(status)) fields.status = 'Choose a valid lead status.'
  if (source !== '' && !LEAD_SOURCES.includes(source)) fields.source = 'Choose a valid lead source.'
  const page = positiveInteger(query, 'page', 1, Number.MAX_SAFE_INTEGER, fields)
  const limit = positiveInteger(query, 'limit', 10, MAX_LIMIT, fields)

  if (Object.keys(fields).length) throw validationError(fields)
  res.locals.list = { search: search.trim(), status, source, page, limit }
  next()
}

export function validateSummaryQuery(req, res, next) {
  const fields = unknownFields(req.query, [], 'This query parameter is not allowed.')
  if (Object.keys(fields).length) throw validationError(fields)
  next()
}
