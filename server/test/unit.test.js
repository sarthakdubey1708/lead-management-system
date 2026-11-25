import assert from 'node:assert/strict'
import test from 'node:test'
import { requireOrigin } from '../middleware/require-origin.js'
import { buildSampleLeads } from '../seeds/fixtures.js'
import { literalSearch } from '../utils/literal-search.js'
import { validateListQuery } from '../validators/lead-query.js'
import { addUtcDays, utcDateLabel, utcDay } from '../utils/utc-dates.js'

test('unsafe requests accept only the configured origin or an exact-origin Referer', () => {
  const origin = 'http://localhost:5173'
  const enforce = requireOrigin(origin)
  const check = (headers) => {
    let allowed = false
    enforce({ get: (header) => headers[header] }, {}, () => { allowed = true })
    assert.equal(allowed, true)
  }

  check({ Origin: origin })
  check({ Referer: `${origin}/leads?page=2` })
  for (const headers of [
    {},
    { Origin: 'null', Referer: `${origin}/leads` },
    { Origin: 'http://localhost:5174' },
    { Referer: 'http://localhost:5174/leads' },
    { Referer: 'not a URL' },
  ]) {
    assert.throws(() => check(headers), { status: 403, code: 'FORBIDDEN' })
  }
})

test('UTC dates cross month, year and leap-day boundaries', () => {
  const today = utcDay(new Date('2024-03-01T02:00:00.000+01:00'))
  assert.equal(today.toISOString(), '2024-03-01T00:00:00.000Z')
  assert.equal(utcDateLabel(addUtcDays(today, -1)), '2024-02-29')
  assert.equal(utcDateLabel(addUtcDays(new Date('2025-01-01T00:00:00Z'), -1)), '2024-12-31')
})

test('the fixture has 40 unique, stable IDs and the specified status distribution', () => {
  const today = new Date('2026-11-25T12:00:00Z')
  const leads = buildSampleLeads(today)
  const ids = leads.map((lead) => lead._id)
  assert.equal(leads.length, 40)
  assert.equal(new Set(ids).size, 40)
  assert.ok(ids.every((id) => /^[0-9a-f]{24}$/.test(id)))
  assert.deepEqual(ids, buildSampleLeads(addUtcDays(today, 1)).map((lead) => lead._id))

  const counts = {}
  for (const { leadStatus, email, phone, createdAt, updatedAt } of leads) {
    counts[leadStatus] = (counts[leadStatus] ?? 0) + 1
    assert.match(email, /@example\.com$/)
    assert.match(phone, /^\+1 202-555-01\d{2}$/)
    assert.equal(createdAt.getTime(), updatedAt.getTime())
    assert.ok(createdAt >= addUtcDays(utcDay(today), -29) && createdAt <= today)
  }
  assert.deepEqual(counts, { New: 12, Contacted: 10, Interested: 8, Converted: 6, Lost: 4 })
})

test('list queries parse scalar filters and bounded pagination', () => {
  const parse = (query) => {
    const res = { locals: {} }
    validateListQuery({ query }, res, () => {})
    return res.locals.list
  }
  assert.deepEqual(parse({}), { search: '', status: '', source: '', page: 1, limit: 10 })
  assert.deepEqual(parse({ search: '  Avery  ', status: 'New', source: 'Website', page: '2', limit: '100' }), {
    search: 'Avery', status: 'New', source: 'Website', page: 2, limit: 100,
  })
  for (const query of [
    { search: ['a', 'b'] },
    { search: 'a'.repeat(101) },
    { status: 'All' },
    { source: 'website' },
    { page: '0' },
    { page: '1\n' },
    { page: '9007199254740992' },
    { limit: '101' },
    { 'status[$ne]': 'New' },
  ]) {
    assert.throws(() => parse(query), { status: 400, code: 'VALIDATION_ERROR' })
  }
})

test('search terms match case-insensitive literal substrings', () => {
  assert.equal(literalSearch('Avery').test('Name: avery morgan'), true)
  assert.equal(literalSearch('.*').test('ordinary text'), false)
  assert.equal(literalSearch('[a-z]').test('literal [A-Z] example'), true)
  assert.equal(literalSearch('x|y').test('x and y'), false)
  assert.equal(literalSearch('a\\b').test('A\\B'), true)
})
