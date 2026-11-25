import { parseArgs } from 'node:util'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { loadEnvironment, mongoUri } from '../config/env.js'
import { utcDateLabel } from '../utils/utc-dates.js'
import { refreshSampleLeadDates } from './sample-leads.js'

const usage = 'Usage: node seeds/refresh-sample-dates.js --date YYYY-MM-DD [--apply]. Supply a valid UTC date.'

try {
  const { values } = parseArgs({ options: { date: { type: 'string' }, apply: { type: 'boolean' } } })
  const reference = new Date(`${values.date}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date ?? '') || !Number.isFinite(reference.getTime()) || utcDateLabel(reference) !== values.date) {
    throw new Error(usage)
  }

  loadEnvironment()
  const { connection } = await connectDatabase(mongoUri())
  console.log(`${values.apply ? 'Apply' : 'Preview'} for database ${connection.name}, ending ${values.date} UTC.`)
  const { existing, missing, planned, modified } = await refreshSampleLeadDates(reference, { apply: values.apply })
  console.log(`Original sample IDs: ${existing} present, ${missing} missing. Date changes: ${planned} planned, ${modified} applied.`)
} catch (error) {
  if (error.message === usage || error.code?.startsWith('ERR_PARSE_ARGS')) console.error(usage)
  else console.error(`Sample date refresh failed (${error.name}). Check MONGODB_URI and database permissions.`)
  process.exitCode = 1
} finally {
  await disconnectDatabase()
}
