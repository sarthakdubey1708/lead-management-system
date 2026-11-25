import { Types } from 'mongoose'
import { Lead } from '../models/lead.js'
import { buildSampleLeads } from './fixtures.js'

export async function seedSampleLeads(now = new Date()) {
  const operations = buildSampleLeads(now).map(({ _id, ...lead }) => ({
    updateOne: {
      // Match only the stable ID. Existing leads keep their fields and timestamps.
      filter: { _id },
      update: { $setOnInsert: lead },
      upsert: true,
      timestamps: false,
    },
  }))

  const result = await Lead.bulkWrite(operations)
  return { inserted: result.upsertedCount, existing: result.matchedCount }
}

export async function refreshSampleLeadDates(referenceDate, { apply = false } = {}) {
  const schedule = new Map(buildSampleLeads(referenceDate).map(({ _id, createdAt }) => [_id, createdAt]))
  const ids = [...schedule.keys()].map((id) => new Types.ObjectId(id))
  const existing = await Lead.collection.find({ _id: { $in: ids } }, { projection: { createdAt: 1 } }).toArray()
  const operations = existing.flatMap(({ _id, createdAt }) => {
    const nextDate = schedule.get(_id.toHexString())
    return createdAt?.getTime() === nextDate.getTime() ? [] : [{
      updateOne: {
        filter: { _id },
        update: { $set: { createdAt: nextDate } },
        upsert: false,
      },
    }]
  })

  // Use the collection for this explicit maintenance operation. The model treats createdAt as
  // immutable, and its timestamp middleware would also change updatedAt.
  const result = apply && operations.length ? await Lead.collection.bulkWrite(operations) : null
  return { existing: existing.length, missing: ids.length - existing.length, planned: operations.length, modified: result?.modifiedCount ?? 0 }
}
