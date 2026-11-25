export const LEAD_STATUSES = Object.freeze(['New', 'Contacted', 'Interested', 'Converted', 'Lost'])

export const LEAD_SOURCES = Object.freeze([
  'Website',
  'Instagram',
  'LinkedIn',
  'Referral',
  'Advertisement',
  'Cold Calling',
])

export const LEAD_FIELDS = Object.freeze([
  'fullName',
  'email',
  'phone',
  'companyName',
  'leadSource',
  'leadStatus',
])

export const LEAD_TEXT_LIMITS = Object.freeze({
  fullName: [2, 100],
  email: [1, 254],
  phone: [7, 32],
  companyName: [1, 150],
})
