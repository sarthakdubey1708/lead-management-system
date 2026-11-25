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
