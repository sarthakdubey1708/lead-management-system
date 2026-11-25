import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { loadEnvironment, mongoUri, readJwtSecret } from '../config/env.js'
import { adminSeedConfig } from '../validators/auth.js'
import { seedAdmin } from './admin.js'
import { seedSampleLeads } from './sample-leads.js'

async function seed() {
  const uri = mongoUri()
  readJwtSecret()
  const administrator = adminSeedConfig()

  try {
    await connectDatabase(uri)
    const adminInserted = await seedAdmin(administrator)
    console.log(adminInserted ? 'Administrator inserted.' : 'Existing administrator kept.')
    const { inserted, existing } = await seedSampleLeads()
    console.log(`Sample leads: ${inserted} inserted, ${existing} already present.`)
  } catch (error) {
    throw new Error(`Database seed failed (${error.name}). Check the MongoDB connection and seed permissions.`, { cause: error })
  }
}

try {
  loadEnvironment()
  await seed()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await disconnectDatabase()
}
