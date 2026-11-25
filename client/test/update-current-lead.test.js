import assert from 'node:assert/strict'
import test from 'node:test'
import { updateCurrentLead } from '../src/leads/update-current-lead.js'
import { leadPayload } from '../src/utils/validation.js'

const displayed = {
  _id: 'test-lead',
  fullName: 'Sample Lead',
  email: 'sample@example.com',
  phone: '+1 202-555-0101',
  companyName: 'Original Company',
  leadSource: 'Website',
  leadStatus: 'New',
  updatedAt: '2026-11-25T12:00:00Z',
}

const statusPayload = (latest) => leadPayload({ ...latest, leadStatus: 'Contacted' })

test('a stale lead cannot send a PUT, and a retry preserves the newer company name', async () => {
  const stored = { ...displayed, companyName: 'Newer Company', updatedAt: '2026-11-25T12:01:00Z' }
  const puts = []
  async function request(path, options) {
    assert.equal(path, '/leads/test-lead')
    if (options) puts.push(options)
    return { data: { ...stored } }
  }

  assert.equal(await updateCurrentLead(request, displayed, statusPayload), false)
  assert.deepEqual(puts, [])
  assert.equal(await updateCurrentLead(request, stored, statusPayload), true)
  assert.deepEqual(puts, [{ method: 'PUT', body: statusPayload(stored) }])
  assert.equal(puts[0].body.companyName, 'Newer Company')
})

test('a changed writable field or timestamp is enough to detect a conflict', async () => {
  for (const changed of [
    { ...displayed, companyName: 'Different Company' },
    { ...displayed, updatedAt: '2026-11-25T12:01:00Z' },
  ]) {
    assert.equal(await updateCurrentLead(async () => ({ data: changed }), displayed, () => {
      assert.fail('A conflict must stop before constructing the payload')
    }), false)
  }
})

test('a failed detail request stops the write and preserves the original error', async () => {
  for (const status of [404, 401, undefined]) {
    const failure = Object.assign(new Error('Could not load the lead'), { status })
    await assert.rejects(updateCurrentLead(async () => { throw failure }, displayed, statusPayload), (error) => error === failure)
  }
})
