import { LEAD_FIELDS, SOURCES, STATUSES } from './constants.js'

export function leadPayload(values) {
  return Object.fromEntries(LEAD_FIELDS.map((field) => [field, values[field].trim()]))
}

function isEmail(value) {
  const at = value.lastIndexOf('@')
  if (value.length > 254 || at < 1) return false
  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  return (/^[^\s@]+$/.test(local) || /^".+"$/u.test(local)) && /^[^\s@]+\.[^\s@]+$/.test(domain)
}

export function validateLead(values) {
  const errors = {}
  if (values.fullName.length < 2 || values.fullName.length > 100) {
    errors.fullName = 'Enter a full name between 2 and 100 characters.'
  }
  if (!isEmail(values.email)) errors.email = 'Enter a valid email address.'
  const digits = values.phone.replace(/\D/g, '')
  if (values.phone.length > 32 || !/^\+?[0-9 ()-]+$/.test(values.phone) || !/^\d{7,15}$/.test(digits)) {
    errors.phone = 'Enter 7–15 digits with an optional leading +, spaces, parentheses or hyphens.'
  }
  if (!values.companyName || values.companyName.length > 150) {
    errors.companyName = 'Enter a company name between 1 and 150 characters.'
  }
  if (!SOURCES.includes(values.leadSource)) errors.leadSource = 'Choose a lead source.'
  if (!STATUSES.includes(values.leadStatus)) errors.leadStatus = 'Choose a lead status.'
  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!isEmail(email)) errors.email = 'Enter a valid email address.'
  if (!password || new TextEncoder().encode(password).length > 72) {
    errors.password = 'Enter a password up to 72 UTF-8 bytes.'
  }
  return errors
}

export function focusFirstError(form, errors, fieldOrder) {
  const name = fieldOrder.find((field) => errors[field])
  if (name) requestAnimationFrame(() => form.current?.elements.namedItem(name)?.focus())
}
