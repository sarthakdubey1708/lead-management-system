import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { createServer } from 'node:http'
import test from 'node:test'
import mongoose from 'mongoose'
import { createDatabaseConnector } from '../config/database.js'

test('the serverless connector shares in-flight and warm connections and retries a failed connection', async ({ mock }) => {
  const uri = 'mongodb://127.0.0.1:27017/deployment_test'
  const failure = new Error('Initial connection failed')
  const connect = mock.method(mongoose, 'connect', async () => mongoose)
  connect.mock.mockImplementationOnce(async () => { throw failure })

  const ensureDatabase = createDatabaseConnector(uri)
  const first = ensureDatabase()
  assert.equal(ensureDatabase(), first)
  await assert.rejects(first, failure)

  const second = ensureDatabase()
  assert.notEqual(second, first)
  assert.equal(ensureDatabase(), second)
  assert.equal(await second, mongoose)
  assert.equal(ensureDatabase(), second)
  assert.equal(connect.mock.callCount(), 2)
  const [connectedUri, options] = connect.mock.calls[1].arguments
  assert.equal(connectedUri, uri)
  assert.equal(options.maxPoolSize, 5)
  assert.equal(options.minPoolSize, 0)
  assert.equal(options.autoIndex, false)
})

test('the Vercel handler preserves JSON errors, exact origin and cookie security before connecting to MongoDB', async (t) => {
  const origin = 'https://crm.example.com'
  const connect = t.mock.method(mongoose, 'connect', async () => {
    throw new Error('These requests must not connect to MongoDB')
  })
  t.mock.property(process, 'env', {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/deployment_test',
    JWT_SECRET: randomBytes(32).toString('hex'),
    APP_ORIGIN: origin,
    NODE_ENV: 'development',
    LOGIN_RATE_LIMIT: '1',
  })
  const { default: handler } = await import('../../api/handler.mjs')
  const server = createServer(handler).listen(0, '127.0.0.1')
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  }))
  await once(server, 'listening')
  const url = `http://127.0.0.1:${server.address().port}`

  async function expectError(response, status, code) {
    assert.equal(response.status, status)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal((await response.json()).error.code, code)
  }

  await expectError(await fetch(`${url}/api/auth/me`), 401, 'UNAUTHORIZED')
  await expectError(await fetch(`${url}/api/unknown?limit=5`), 404, 'NOT_FOUND')
  const logout = await fetch(`${url}/api/auth/logout`, { method: 'POST', headers: { Origin: origin } })
  assert.equal(logout.status, 200)
  assert.equal(logout.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await logout.json(), { success: true, data: null })
  const cookie = logout.headers.get('set-cookie')
  for (const attribute of ['Path=/api', 'HttpOnly', 'Secure', 'SameSite=Strict']) {
    assert.ok(cookie.split('; ').includes(attribute))
  }

  function login(forwardedFor, requestOrigin = origin) {
    return fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { Origin: requestOrigin, 'Content-Type': 'application/json', 'X-Forwarded-For': forwardedFor },
      body: '{}',
    })
  }

  await expectError(await login('203.0.113.1', `${origin}.invalid`), 403, 'FORBIDDEN')
  await expectError(await login('203.0.113.1'), 400, 'VALIDATION_ERROR')
  await expectError(await login('192.0.2.10, 203.0.113.1'), 429, 'RATE_LIMITED')
  await expectError(await login('203.0.113.2'), 400, 'VALIDATION_ERROR')
  assert.equal(connect.mock.callCount(), 0)
})
