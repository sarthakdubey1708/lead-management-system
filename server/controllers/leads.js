import { LEAD_FIELDS } from '../constants/leads.js'
import { Lead } from '../models/lead.js'
import { ApiError } from '../utils/api-error.js'
import { literalSearch } from '../utils/literal-search.js'

function leadData(lead) {
  return Object.fromEntries(
    ['_id', ...LEAD_FIELDS, 'createdAt', 'updatedAt'].map((field) => [field, lead[field]]),
  )
}

function requireLead(lead) {
  if (!lead) throw new ApiError(404, 'LEAD_NOT_FOUND', 'The lead was not found.')
  return lead
}

export async function listLeads(req, res) {
  const { search, status, source, page, limit } = res.locals.list
  const filter = {}
  if (status) filter.leadStatus = status
  if (source) filter.leadSource = source
  if (search) {
    const literal = literalSearch(search)
    filter.$or = ['fullName', 'email', 'phone', 'companyName'].map((field) => ({ [field]: literal }))
  }

  const offset = Math.min((page - 1) * limit, Number.MAX_SAFE_INTEGER)
  const [result] = await Lead.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        leads: [...(offset ? [{ $skip: offset }] : []), { $limit: limit }],
        count: [{ $count: 'total' }],
      },
    },
  ])
  const total = result.count[0]?.total ?? 0
  res.json({
    success: true,
    data: result.leads.map(leadData),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function getLead(req, res) {
  const lead = requireLead(await Lead.findById(req.params.id).lean())
  res.json({ success: true, data: leadData(lead) })
}

export async function createLead(req, res) {
  const lead = await Lead.create(res.locals.lead)
  res.status(201).json({ success: true, data: leadData(lead) })
}

export async function updateLead(req, res) {
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { $set: res.locals.lead },
    { returnDocument: 'after', runValidators: true },
  ).lean()
  res.json({ success: true, data: leadData(requireLead(lead)) })
}

export async function deleteLead(req, res) {
  requireLead(await Lead.findByIdAndDelete(req.params.id).lean())
  res.json({ success: true, data: null })
}
