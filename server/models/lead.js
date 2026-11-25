import mongoose from 'mongoose'
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TEXT_LIMITS } from '../constants/leads.js'
import { isLeadEmail, isLeadPhone } from '../utils/lead-format.js'

function textField([minLength, maxLength]) {
  return { type: String, required: true, trim: true, minLength, maxLength }
}

const leadSchema = new mongoose.Schema({
  fullName: textField(LEAD_TEXT_LIMITS.fullName),
  email: {
    ...textField(LEAD_TEXT_LIMITS.email),
    lowercase: true,
    validate: isLeadEmail,
  },
  phone: { ...textField(LEAD_TEXT_LIMITS.phone), validate: isLeadPhone },
  companyName: textField(LEAD_TEXT_LIMITS.companyName),
  leadSource: { type: String, required: true, enum: LEAD_SOURCES },
  leadStatus: { type: String, required: true, enum: LEAD_STATUSES, default: 'New' },
}, { timestamps: true, versionKey: false })

leadSchema.index({ createdAt: -1, _id: -1 })

export const Lead = mongoose.model('Lead', leadSchema)
