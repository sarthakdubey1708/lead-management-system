import validator from 'validator'

export function isLeadEmail(value) {
  return validator.isEmail(value, { allow_utf8_local_part: true })
}

export function isLeadPhone(value) {
  return /^\+?[0-9 ()-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''))
}
