const MS_PER_DAY = 24 * 60 * 60 * 1000

export function utcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function addUtcDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

export function utcDateLabel(date) {
  return date.toISOString().slice(0, 10)
}
