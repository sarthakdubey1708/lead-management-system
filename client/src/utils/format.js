const createdDate = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})
const trendDate = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
})
const number = new Intl.NumberFormat('en-US')

export function formatDate(value) {
  return createdDate.format(new Date(value))
}

export function formatTrendDate(value) {
  return trendDate.format(new Date(`${value}T00:00:00Z`))
}

export function formatCount(value) {
  return number.format(value)
}
