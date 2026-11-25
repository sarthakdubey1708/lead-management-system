import bcrypt from 'bcryptjs'
import { ADMIN_ROLE, PASSWORD_COST } from '../constants/auth.js'
import { User } from '../models/user.js'

export async function seedAdmin({ name, email, password }) {
  await User.init()
  const filter = { role: ADMIN_ROLE }
  if (await User.exists(filter)) return false

  const passwordHash = await bcrypt.hash(password, PASSWORD_COST)
  const now = new Date()
  try {
    const result = await User.updateOne(
      filter,
      { $setOnInsert: { name, email, passwordHash, createdAt: now, updatedAt: now } },
      { upsert: true, runValidators: true, timestamps: false, setDefaultsOnInsert: false },
    )
    return result.upsertedCount === 1
  } catch (error) {
    if (error.code === 11000 && await User.exists(filter)) return false
    throw error
  }
}
