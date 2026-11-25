import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { after, before, test } from 'node:test'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createApp } from '../app.js'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/leads.js'
import { Lead } from '../models/lead.js'
import { User } from '../models/user.js'
import { seedAdmin } from '../seeds/admin.js'
import { buildSampleLeads } from '../seeds/fixtures.js'
import { refreshSampleLeadDates, seedSampleLeads } from '../seeds/sample-leads.js'
import { addUtcDays, utcDateLabel, utcDay } from '../utils/utc-dates.js'

const origin = 'http://localhost:5173'
const jwtSecret = randomBytes(32).toString('hex')
const admin = {
  name: 'Test Administrator',
  email: 'test-admin@example.com',
  password: ' ' + randomBytes(18).toString('hex') + ' ',
}
const newLead = {
  fullName: '  Kai (Test)  ',
  email: '  QA@Example.COM  ',
  phone: ' +1 (202) 555-0199 ',
  companyName: ' Literal [Works] ',
  leadSource: 'Referral',
}
const missingId = '000000000000000000000000'
let connection
let server
let base
let adminCookie
let publicAdmin

before(async () => {
  const uri = process.env.MONGODB_TEST_URI ?? 'mongodb://127.0.0.1:27017'
  const dbName = `bizleap_test_${randomUUID().replaceAll('-', '')}`
  const mongoose = await connectDatabase(uri, { dbName })
  connection = mongoose.connection
  await connection.db.command({ ping: 1 })

  assert.equal(await seedAdmin(admin), true)
  const stored = await User.findOne({ email: admin.email }).lean()
  publicAdmin = { _id: String(stored._id), name: admin.name, email: admin.email, role: 'admin' }

  const api = await startApi()
  server = api.server
  base = api.url
  const response = await login({ url: base })
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { success: true, data: { user: publicAdmin } })
  adminCookie = response.headers.get('set-cookie').split(';', 1)[0]
})

after(async () => {
  try {
    if (server?.listening) await closeServer(server)
    if (connection) await connection.dropDatabase()
  } finally {
    await disconnectDatabase()
  }
})

async function startApi(options = {}) {
  const listener = createApp({ appOrigin: origin, jwtSecret, ...options }).listen(0, '127.0.0.1')
  await once(listener, 'listening')
  return { server: listener, url: `http://127.0.0.1:${listener.address().port}/api` }
}

function closeServer(listener) {
  return new Promise((resolve, reject) => {
    listener.close((error) => error ? reject(error) : resolve())
  })
}

async function request(path, { url = base, method = 'GET', body, raw, headers = {}, cookie = adminCookie } = {}) {
  const response = await fetch(url + path, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  })
  return { status: response.status, body: await response.json(), headers: response.headers }
}

function login({ email = admin.email, password = admin.password, loginOrigin = origin, url = base } = {}) {
  return request('/auth/login', {
    url,
    method: 'POST',
    body: { email, password },
    headers: { Origin: loginOrigin },
    cookie: null,
  })
}

function assertError(response, status, code) {
  assert.equal(response.status, status)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, code)
  assert.equal(typeof response.body.error.message, 'string')
  assert.equal(Object.hasOwn(response.body, 'stack'), false)
}

test('MongoDB ping succeeds and an empty dashboard returns all ordered zero buckets', async () => {
  const { status, body } = await request('/dashboard/summary')
  assert.equal(status, 200)
  assert.equal(body.success, true)
  const summary = body.data
  assert.equal(summary.totalLeads, 0)
  assert.deepEqual(summary.byStatus, LEAD_STATUSES.map((status) => ({ status, count: 0 })))
  assert.deepEqual(summary.bySource, LEAD_SOURCES.map((source) => ({ source, count: 0 })))
  const today = utcDay(new Date())
  assert.deepEqual(summary.leadsOverTime, Array.from({ length: 30 }, (_, offset) => ({
    date: utcDateLabel(addUtcDays(today, offset - 29)),
    count: 0,
  })))
})

test('lead CRUD normalizes fields, preserves createdAt and deletes the record', async () => {
  const created = await request('/leads', { method: 'POST', body: newLead, headers: { Origin: origin } })
  assert.equal(created.status, 201)
  assert.equal(created.body.success, true)
  const lead = created.body.data
  assert.match(lead._id, /^[0-9a-f]{24}$/)
  assert.equal(lead.createdAt, new Date(lead.createdAt).toISOString())
  assert.deepEqual(lead, {
    _id: lead._id,
    fullName: 'Kai (Test)',
    email: 'qa@example.com',
    phone: '+1 (202) 555-0199',
    companyName: 'Literal [Works]',
    leadSource: 'Referral',
    leadStatus: 'New',
    createdAt: lead.createdAt,
    updatedAt: lead.createdAt,
  })
  const path = `/leads/${lead._id}`
  const read = await request(path)
  assert.equal(read.status, 200)
  assert.deepEqual(read.body, created.body)

  const updated = await request(path, {
    method: 'PUT',
    body: { ...newLead, companyName: 'Updated Works', leadStatus: 'Interested' },
    headers: { Referer: `${origin}/leads` },
  })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.data.companyName, 'Updated Works')
  assert.equal(updated.body.data.leadStatus, 'Interested')
  assert.equal(updated.body.data.createdAt, lead.createdAt)
  assert.ok(updated.body.data.updatedAt > lead.updatedAt)

  const deleted = await request(path, { method: 'DELETE', headers: { Origin: origin } })
  assert.equal(deleted.status, 200)
  assert.deepEqual(deleted.body, { success: true, data: null })
  assertError(await request(path), 404, 'LEAD_NOT_FOUND')
})

test('validation rejects body, query, ID and origin errors using the specified envelopes', async () => {
  const post = (options) => request('/leads', { method: 'POST', ...options })
  const headers = { Origin: origin }
  const invalid = await post({ body: { ...newLead, _id: missingId, email: 'invalid' }, headers })
  assertError(invalid, 400, 'VALIDATION_ERROR')
  assert.deepEqual(Object.keys(invalid.body.error.fields).sort(), ['_id', 'email'])
  assertError(await post({ raw: '{', headers: { ...headers, 'Content-Type': 'application/json' } }), 400, 'VALIDATION_ERROR')
  assertError(await post({ raw: 'x'.repeat(17000), headers: { ...headers, 'Content-Type': 'application/json' } }), 400, 'VALIDATION_ERROR')
  assertError(await post({ raw: 'text', headers }), 415, 'UNSUPPORTED_MEDIA_TYPE')
  assertError(await post({ body: newLead, headers: { Origin: 'null', Referer: origin } }), 403, 'FORBIDDEN')
  assertError(await request(`/leads/${missingId}`, { method: 'DELETE' }), 403, 'FORBIDDEN')
  assertError(await request('/leads/bad-id'), 400, 'INVALID_ID')
  assertError(await request(`/leads/${missingId}`, { method: 'PUT', headers, body: newLead }), 400, 'VALIDATION_ERROR')
  assertError(await request(`/leads/${missingId}`, { method: 'PUT', headers, body: { ...newLead, leadStatus: 'New' } }), 404, 'LEAD_NOT_FOUND')
  assertError(await request(`/leads/${missingId}`, { method: 'DELETE', headers }), 404, 'LEAD_NOT_FOUND')
  for (const query of ['page=0', 'page=1.5', 'limit=101', 'status=All', 'source=other', 'search=a&search=b', 'status%5B%24ne%5D=New', 'extra=1']) {
    assertError(await request(`/leads?${query}`), 400, 'VALIDATION_ERROR')
  }
  const unknown = await request('/undefined-route')
  assertError(unknown, 404, 'NOT_FOUND')
  assert.equal(unknown.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(unknown.headers.get('cache-control'), 'no-store')
  assert.equal(unknown.headers.get('x-powered-by'), null)
  assertError(await request('/dashboard/undefined', { cookie: null }), 404, 'NOT_FOUND')
})

test('the seed is idempotent and list search, filters and pagination work against MongoDB', async () => {
  const seedDate = new Date()
  assert.deepEqual(await seedSampleLeads(seedDate), { inserted: 40, existing: 0 })
  const { body: firstPage } = await request('/leads')
  assert.equal(firstPage.data.length, 10)
  assert.deepEqual(firstPage.pagination, { page: 1, limit: 10, total: 40, totalPages: 4 })

  const { body: secondPage } = await request('/leads?page=2&limit=10')
  const combined = [...firstPage.data, ...secondPage.data]
  const newest = [...combined].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt) || right._id.localeCompare(left._id),
  )
  assert.deepEqual(combined, newest)
  assert.equal(new Set(combined.map((lead) => lead._id)).size, 20)
  const { body: beyond } = await request('/leads?page=100')
  assert.deepEqual(beyond, { success: true, data: [], pagination: { page: 100, limit: 10, total: 40, totalPages: 4 } })
  assert.deepEqual((await request('/leads?search=&status=&source=')).body, firstPage)

  const { body: filtered } = await request('/leads?search=%20AVERY%20&status=New&source=Website')
  assert.deepEqual(filtered.data.map((lead) => lead.fullName), ['Avery Morgan'])
  for (const search of ['AVERY.MORGAN@', '555-0100', 'ASTERFIELD']) {
    const { body } = await request(`/leads?search=${encodeURIComponent(search)}`)
    assert.deepEqual(body.data, filtered.data)
  }
  for (const query of ['search=.*', 'search=Avery&status=Lost', 'search=Avery&source=Referral']) {
    const { body } = await request(`/leads?${query}`)
    assert.deepEqual(body, { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })
  }

  const seeded = filtered.data[0]
  await Lead.updateOne({ _id: seeded._id }, { $set: { companyName: 'An existing edit' } })
  const saved = await Lead.findById(seeded._id).lean()
  assert.deepEqual(await seedSampleLeads(addUtcDays(seedDate, 1)), { inserted: 0, existing: 40 })
  assert.deepEqual(await Lead.findById(seeded._id).lean(), saved)

  const { body: summary } = await request('/dashboard/summary')
  assert.equal(summary.data.totalLeads, 40)
  assert.deepEqual(summary.data.byStatus.map(({ count }) => count), [12, 10, 8, 6, 4])
  assert.deepEqual(summary.data.bySource.map(({ count }) => count), [7, 7, 7, 7, 6, 6])
  const expected = buildSampleLeads(seedDate)
  assert.deepEqual(summary.data.leadsOverTime, Array.from({ length: 30 }, (_, index) => {
    const date = utcDateLabel(addUtcDays(utcDay(seedDate), index - 29))
    return { date, count: expected.filter((lead) => utcDateLabel(lead.createdAt) === date).length }
  }))
  assert.equal(summary.data.leadsOverTime.reduce((sum, { count }) => sum + count, 0), 40)

  await Lead.collection.updateOne({ _id: saved._id }, {
    $set: { createdAt: addUtcDays(utcDay(seedDate), -30) },
  })
  const { body: historical } = await request('/dashboard/summary')
  assert.equal(historical.data.totalLeads, 40)
  assert.equal(historical.data.leadsOverTime.reduce((sum, { count }) => sum + count, 0), 39)
})

test('sample date refresh previews changes and updates only existing original IDs, preserving edits', async () => {
  const reference = new Date()
  const originals = buildSampleLeads(reference)
  const [first, second] = originals
  await seedSampleLeads(reference)
  await Lead.updateOne({ _id: first._id }, { $set: { companyName: 'Date refresh edit', leadStatus: 'Interested' } })
  await Lead.collection.updateOne({ _id: new Lead.base.Types.ObjectId(first._id) }, {
    $set: { createdAt: addUtcDays(utcDay(reference), -30) },
  })
  const edited = await Lead.findById(first._id).lean()
  const manual = await Lead.create(newLead)
  const unrelated = await Lead.findById(manual._id).lean()
  await Lead.deleteOne({ _id: second._id })
  const preview = await refreshSampleLeadDates(reference)
  assert.equal(preview.existing, 39)
  assert.equal(preview.missing, 1)
  assert.ok(preview.planned > 0)
  assert.equal(preview.modified, 0)
  assert.deepEqual(await Lead.findById(first._id).lean(), edited)

  const applied = await refreshSampleLeadDates(reference, { apply: true })
  assert.equal(applied.modified, preview.planned)
  assert.deepEqual(await Lead.findById(first._id).lean(), { ...edited, createdAt: first.createdAt })
  assert.deepEqual(await Lead.findById(manual._id).lean(), unrelated)
  assert.equal(await Lead.findById(second._id).lean(), null)
  assert.equal(await Lead.countDocuments(), 40)
  assert.deepEqual(await refreshSampleLeadDates(reference, { apply: true }), { existing: 39, missing: 1, planned: 0, modified: 0 })
})

test('login sets an 8-hour HTTP-only session cookie with no token or hash in the body', async () => {
  const response = await login({ email: `  ${admin.email.toUpperCase()}  ` })
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { success: true, data: { user: publicAdmin } })

  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /^access_token=[^;]+;/)
  assert.match(cookie, /; Max-Age=28800(?:;|$)/i)
  assert.match(cookie, /; Path=\/api(?:;|$)/i)
  assert.match(cookie, /; HttpOnly(?:;|$)/i)
  assert.match(cookie, /; SameSite=Strict(?:;|$)/i)
  assert.doesNotMatch(cookie, /; (?:Secure|Domain=)/i)
  const token = cookie.slice('access_token='.length).split(';', 1)[0]
  const { header, payload } = jwt.decode(token, { complete: true })
  assert.equal(header.alg, 'HS256')
  assert.equal(payload.sub, publicAdmin._id)
  assert.equal(payload.exp - payload.iat, 28800)
})

test('incorrect passwords and unknown administrators return the same 401', async () => {
  const incorrect = await login({ password: admin.password.trim() })
  const unknown = await login({ email: 'unknown@example.com' })
  assertError(incorrect, 401, 'INVALID_CREDENTIALS')
  assertError(unknown, 401, 'INVALID_CREDENTIALS')
  assert.deepEqual(incorrect.body, unknown.body)
  assert.equal(incorrect.headers.get('set-cookie'), null)
  assert.equal(unknown.headers.get('set-cookie'), null)
})

test('session verification returns the same safe public user as login', async () => {
  const response = await request('/auth/me')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { success: true, data: { user: publicAdmin } })
  assertError(await request('/auth/me', { cookie: null }), 401, 'UNAUTHORIZED')
})

test('session verification rejects invalid signatures, expirations, algorithms and nonexistent users', async () => {
  const options = { algorithm: 'HS256', subject: publicAdmin._id, expiresIn: 28800 }
  const tokens = [
    'malformed',
    jwt.sign({}, randomBytes(32).toString('hex'), options),
    jwt.sign({}, jwtSecret, { ...options, expiresIn: -1 }),
    jwt.sign({}, jwtSecret, { ...options, algorithm: 'HS384' }),
    jwt.sign({}, jwtSecret, { ...options, subject: missingId }),
    jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: publicAdmin._id }),
  ]
  for (const token of tokens) {
    const cookie = `access_token=${token}`
    assertError(await request('/auth/me', { cookie }), 401, 'UNAUTHORIZED')
  }
})

test('a valid token stops granting access when its user no longer has the admin role', async () => {
  const user = await User.findById(publicAdmin._id)
  const { _id } = user
  await User.collection.updateOne({ _id }, { $set: { role: 'inactive' } })
  try {
    assertError(await request('/auth/me'), 401, 'UNAUTHORIZED')
    assertError(await request('/leads'), 401, 'UNAUTHORIZED')
  } finally {
    await User.collection.updateOne({ _id }, { $set: { role: 'admin' } })
  }
})

test('logout clears the cookie on /api and is idempotent with an expired or missing session', async () => {
  const expired = jwt.sign({}, jwtSecret, { subject: publicAdmin._id, expiresIn: -1 })
  for (const cookie of [adminCookie, `access_token=${expired}`, null]) {
    const response = await request('/auth/logout', { method: 'POST', headers: { Origin: origin }, cookie })
    assert.equal(response.status, 200)
    assert.deepEqual(response.body, { success: true, data: null })
    const cleared = response.headers.get('set-cookie')
    assert.match(cleared, /^access_token=;/)
    assert.match(cleared, /; Path=\/api(?:;|$)/i)
    assert.match(cleared, /; HttpOnly(?:;|$)/i)
    assert.match(cleared, /; SameSite=Strict(?:;|$)/i)
    assert.match(cleared, /; Expires=Thu, 01 Jan 1970 00:00:00 GMT(?:;|$)/i)
    assert.doesNotMatch(cleared, /; (?:Secure|Domain=)/i)
  }
  assertError(await request('/auth/me', { cookie: null }), 401, 'UNAUTHORIZED')
})

test('all lead and dashboard endpoints require an administrator session', async () => {
  const path = `/leads/${missingId}`
  const requests = [
    ['/leads', { method: 'GET' }],
    ['/leads', { method: 'POST', body: newLead }],
    [path, { method: 'GET' }],
    [path, { method: 'PUT', body: { ...newLead, leadStatus: 'New' } }],
    [path, { method: 'DELETE' }],
    ['/dashboard/summary', { method: 'GET' }],
  ]
  for (const [endpoint, options] of requests) {
    assertError(await request(endpoint, { ...options, headers: { Origin: origin }, cookie: null }), 401, 'UNAUTHORIZED')
  }
})

test('auth writes require an exact Origin or a same-origin Referer', async () => {
  const credentials = { email: admin.email, password: admin.password }
  for (const [path, body] of [['/auth/login', credentials], ['/auth/logout', undefined]]) {
    for (const headers of [{}, { Origin: 'null' }, { Origin: 'http://localhost:5174', Referer: origin }]) {
      const response = await request(path, { method: 'POST', body, headers, cookie: null })
      assertError(response, 403, 'FORBIDDEN')
      assert.equal(response.headers.get('set-cookie'), null)
    }
    const response = await request(path, {
      method: 'POST', body, headers: { Referer: `${origin}/login` }, cookie: null,
    })
    assert.equal(response.status, 200)
  }
})

test('login rejects role input, non-JSON requests and malformed credentials', async () => {
  const credentials = { email: admin.email, password: admin.password }
  const headers = { Origin: origin }
  const role = await request('/auth/login', { method: 'POST', body: { ...credentials, role: 'admin' }, headers, cookie: null })
  assertError(role, 400, 'VALIDATION_ERROR')
  assert.ok(role.body.error.fields.role)
  assertError(await login({ password: '😀'.repeat(19) }), 400, 'VALIDATION_ERROR')
  assertError(await request('/auth/login', { method: 'POST', raw: 'email=test', headers, cookie: null }), 415, 'UNSUPPORTED_MEDIA_TYPE')
  assertError(await request('/auth/login', {
    method: 'POST', raw: '{', headers: { ...headers, 'Content-Type': 'application/json' }, cookie: null,
  }), 400, 'VALIDATION_ERROR')
})

test('login attempt limit returns the contract error and Retry-After', async () => {
  const api = await startApi({ loginLimit: 2 })
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      assertError(await login({ url: api.url, password: 'wrong password' }), 401, 'INVALID_CREDENTIALS')
    }
    const blocked = await login({ url: api.url })
    assertError(blocked, 429, 'RATE_LIMITED')
    assert.ok(Number(blocked.headers.get('retry-after')) > 0)
    assert.equal(blocked.headers.get('set-cookie'), null)
  } finally {
    await closeServer(api.server)
  }
})

test('HTTPS-origin configuration sets and clears Secure cookies', async () => {
  const appOrigin = 'https://crm.example.com'
  const api = await startApi({ appOrigin, environment: 'production' })
  try {
    const response = await login({ url: api.url, loginOrigin: appOrigin })
    assert.equal(response.status, 200)
    const cookie = response.headers.get('set-cookie')
    assert.match(cookie, /; Secure(?:;|$)/i)
    assert.ok(response.headers.get('strict-transport-security'))
    const logout = await request('/auth/logout', {
      url: api.url, method: 'POST', headers: { Origin: appOrigin }, cookie: cookie.split(';', 1)[0],
    })
    assert.equal(logout.status, 200)
    assert.match(logout.headers.get('set-cookie'), /^access_token=;.*; Secure(?:;|$)/i)
  } finally {
    await closeServer(api.server)
  }
})

test('administrator seed hashes at cost 12 and reruns preserve the stored administrator', async () => {
  const getStored = () => User.findById(publicAdmin._id).select('+passwordHash').lean()
  const lookup = await User.findById(publicAdmin._id).lean()
  assert.equal(Object.hasOwn(lookup, 'passwordHash'), false)
  const previous = await getStored()
  assert.equal(bcrypt.getRounds(previous.passwordHash), 12)
  assert.equal(await bcrypt.compare(admin.password, previous.passwordHash), true)

  const different = { ...admin, email: 'different@example.com', name: 'Different name', password: randomUUID() }
  assert.equal(await seedAdmin(different), false)
  assert.deepEqual(await getStored(), previous)
  assert.equal(await User.countDocuments(), 1)
})
