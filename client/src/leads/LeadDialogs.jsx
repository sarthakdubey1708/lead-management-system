import { useId, useRef, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { Dialog } from '../components/Dialog.jsx'
import { Field, FormError } from '../components/Field.jsx'
import { LEAD_FIELDS, SOURCES, STATUSES, toOptions } from '../utils/constants.js'
import { focusFirstError, leadPayload, validateLead } from '../utils/validation.js'

const blankLead = { fullName: '', email: '', phone: '', companyName: '', leadSource: '', leadStatus: 'New' }
const sourceOptions = [{ value: '', label: 'Choose a source', disabled: true }, ...toOptions(SOURCES)]
const statusOptions = toOptions(STATUSES)
const textFields = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'section-lead name', maxLength: 100 },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'section-lead email', maxLength: 254 },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'section-lead tel', maxLength: 32 },
  { name: 'companyName', label: 'Company', type: 'text', autoComplete: 'section-lead organization', maxLength: 150 },
]

export function LeadForm({ lead, getReturnFocus, onClose, onSave }) {
  const initial = lead ? leadPayload(lead) : blankLead
  const [values, setValues] = useState(initial)
  const [fields, setFields] = useState({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const formId = useId()
  const form = useRef(null)
  const dirty = LEAD_FIELDS.some((field) => values[field] !== initial[field])

  function change(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFields((current) => ({ ...current, [name]: undefined }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const payload = leadPayload(values)
    const validation = validateLead(payload)
    setFields(validation)
    setError('')
    if (Object.keys(validation).length) {
      focusFirstError(form, validation, LEAD_FIELDS)
      return
    }

    setPending(true)
    try {
      await onSave(payload)
    } catch (error) {
      setPending(false)
      if (LEAD_FIELDS.some((field) => error.fields?.[field])) {
        setFields(error.fields)
        focusFirstError(form, error.fields, LEAD_FIELDS)
      } else {
        setError(error.message)
      }
    }
  }

  return (
    <Dialog
      title={lead ? 'Edit lead' : 'Add lead'}
      description={lead ? `Update contact and pipeline details for ${lead.fullName}.` : 'Enter contact and pipeline details. Fields marked * are required.'}
      getReturnFocus={getReturnFocus}
      onClose={onClose}
      pending={pending}
      dirty={dirty}
      sheet
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" form={formId} busy={pending}>Save lead</Button>
        </>
      )}
    >
      <form ref={form} id={formId} onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 gap-4">
          {textFields.map((field, index) => (
            <Field key={field.name} {...field} value={values[field.name]} error={fields[field.name]} onChange={change} required data-initial-focus={index === 0 ? '' : undefined} />
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Source" name="leadSource" options={sourceOptions} value={values.leadSource} error={fields.leadSource} onChange={change} required />
            <Field label="Status" name="leadStatus" options={statusOptions} value={values.leadStatus} error={fields.leadStatus} onChange={change} required={!!lead} optional={!lead} />
          </div>
        </fieldset>
        {error && <div className="mt-4"><FormError>{error}</FormError></div>}
      </form>
    </Dialog>
  )
}

export function DeleteLead({ lead, getReturnFocus, onClose, onDelete }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    if (pending) return
    setPending(true)
    setError('')
    try {
      await onDelete()
    } catch (error) {
      setPending(false)
      setError(error.message)
    }
  }

  return (
    <Dialog
      title={`Delete ${lead.fullName}?`}
      description="This cannot be undone."
      getReturnFocus={getReturnFocus}
      onClose={onClose}
      pending={pending}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending} data-initial-focus="">Cancel</Button>
          <Button variant="danger" onClick={remove} busy={pending}>Delete lead</Button>
        </>
      )}
    >
      {error && <div className="mt-4"><FormError>{error}</FormError></div>}
    </Dialog>
  )
}
