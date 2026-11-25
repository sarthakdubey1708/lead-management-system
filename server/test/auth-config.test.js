import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import test from 'node:test'
import { readJwtSecret, serverConfig } from '../config/env.js'
import { adminSeedConfig, validateLogin } from '../validators/auth.js'

const env = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017',
  JWT_SECRET: randomBytes(32).toString('hex'),
}

test('server config requires a real secret and permits HTTP only for local development', () => {
  assert.equal(readJwtSecret(env), env.JWT_SECRET)
  for (const secret of [undefined, 'replace_with_a_random_64_hex_character_secret', env.JWT_SECRET + '\n', 'z'.repeat(64)]) {
    assert.throws(() => readJwtSecret({ JWT_SECRET: secret }), /JWT_SECRET/)
  }
  assert.equal(serverConfig(env).appOrigin, 'http://localhost:5173')
  assert.equal(serverConfig(env).loginLimit, 10)

  const production = { ...env, NODE_ENV: 'production', APP_ORIGIN: 'https://crm.example.com', LOGIN_RATE_LIMIT: '4' }
  assert.equal(serverConfig(production).loginLimit, 4)
  assert.equal(serverConfig(production).appOrigin, production.APP_ORIGIN)
  for (const appOrigin of [undefined, 'http://localhost:5173', 'http://crm.example.com', 'https://crm.example.com/']) {
    assert.throws(() => serverConfig({ ...production, APP_ORIGIN: appOrigin }), /APP_ORIGIN/)
  }
  assert.throws(() => serverConfig({ ...env, APP_ORIGIN: 'http://crm.example.com' }), /APP_ORIGIN/)
  for (const value of ['0', '-1', '10.1', '10\n']) {
    assert.throws(() => serverConfig({ ...env, LOGIN_RATE_LIMIT: value }), /LOGIN_RATE_LIMIT/)
  }
})

test('seed requires 12 characters, enforces 72 UTF-8 bytes and preserves surrounding password spaces', () => {
  const administrator = { ADMIN_NAME: ' Sample Admin ', ADMIN_EMAIL: ' ADMIN@example.com ' }
  const password = ' ' + 'é'.repeat(35) + ' '
  assert.deepEqual(adminSeedConfig({ ...administrator, ADMIN_PASSWORD: password }), {
    name: 'Sample Admin', email: 'admin@example.com', password,
  })
  for (const invalid of ['x'.repeat(11), '😀'.repeat(11), password + 'x', 'replace_with_a_strong_private_password']) {
    assert.throws(() => adminSeedConfig({ ...administrator, ADMIN_PASSWORD: invalid }), /ADMIN_PASSWORD/)
  }
})

test('login validation preserves password bytes and rejects unauthorized fields and overlong passwords', () => {
  const email = 'ADMIN@example.com'
  const password = ' ' + 'é'.repeat(35) + ' '
  const parse = (body) => {
    const res = { locals: {} }
    validateLogin({ body }, res, () => {})
    return res.locals.credentials
  }
  assert.deepEqual(parse({ email, password }), { email: 'admin@example.com', password })
  for (const body of [
    { email, password: '' },
    { email, password: password + 'x' },
    { email, password, role: 'admin' },
    { email: { $ne: null }, password },
  ]) {
    assert.throws(() => parse(body), { status: 400, code: 'VALIDATION_ERROR' })
  }
})
