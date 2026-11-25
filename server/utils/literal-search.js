export function literalSearch(search) {
  const escaped = search.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')
  return new RegExp(escaped, 'i')
}
