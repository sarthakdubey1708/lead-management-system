import { LEAD_FIELDS } from '../utils/constants.js'

export async function updateCurrentLead(request, original, payloadFor) {
  const path = `/leads/${original._id}`
  const { data: latest } = await request(path)

  if (latest.updatedAt !== original.updatedAt || LEAD_FIELDS.some((field) => latest[field] !== original[field])) {
    return false
  }

  await request(path, { method: 'PUT', body: payloadFor(latest) })
  return true
}
