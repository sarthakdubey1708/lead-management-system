import mongoose from 'mongoose'
import { ADMIN_ROLE } from '../constants/auth.js'
import { isLeadEmail } from '../utils/lead-format.js'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxLength: 254,
    validate: isLeadEmail,
  },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: [ADMIN_ROLE], default: ADMIN_ROLE, unique: true },
}, { timestamps: true, versionKey: false })

export const User = mongoose.model('User', userSchema)
