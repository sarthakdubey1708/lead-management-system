import { useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Brand } from '../components/Brand.jsx'
import { Button, Tooltip } from '../components/Button.jsx'
import { Field, FormError } from '../components/Field.jsx'
import { PageHeading } from '../components/PageHeading.jsx'
import { STATUSES, STATUS_STYLES } from '../utils/constants.js'
import { focusFirstError, validateLogin } from '../utils/validation.js'
import { useAuth } from './auth-context.js'

function LoginBrand() {
  return (
    <section aria-label="BizLeap lead management" className="brand-surface login-brand flex flex-col px-6 pb-4 md:px-12 lg:px-12 lg:pb-12">
      <div className="mx-auto w-full max-w-xl"><Brand subtitle inverse /></div>
      <div className="m-auto hidden w-full max-w-xl py-12 lg:block">
        <h2 className="max-w-[15ch] text-display tracking-tight text-white">See where every lead stands.</h2>
        <p className="mt-5 max-w-[34ch] text-body-lg text-navy-200">Manage lead records, update statuses, and track conversion in one workspace.</p>
        <div className="mt-8 rounded-hero border border-white/15 bg-navy-950/60 p-5">
          <p className="text-h3 text-white">Lead pipeline</p>
          <ul className="mt-4 grid grid-cols-5 gap-2">
            {STATUSES.map((status) => (
              <li key={status} className="min-w-0 space-y-2">
                <span aria-hidden="true" className={`block h-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                <span className="block text-badge text-navy-100">{status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const form = useRef(null)
  const [values, setValues] = useState({ email: '', password: '' })
  const [fields, setFields] = useState({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggleLabel = visible ? 'Hide password' : 'Show password'

  function change(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFields((current) => ({ ...current, [name]: undefined }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const credentials = { email: values.email.trim(), password: values.password }
    const validation = validateLogin(credentials)
    setError('')
    setFields(validation)
    if (Object.keys(validation).length) {
      focusFirstError(form, validation, ['email', 'password'])
      return
    }

    setPending(true)
    try {
      await login(credentials)
    } catch (error) {
      if (error.fields?.email || error.fields?.password) {
        setFields(error.fields)
        focusFirstError(form, error.fields, ['email', 'password'])
      } else {
        setError(error.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] bg-surface lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-1">
      <LoginBrand />
      <section className="login-form flex min-w-0 justify-center px-6 pt-6 md:px-12 lg:pt-8" aria-label="Administrator sign-in">
        <div className="my-auto w-full min-w-0 max-w-login">
          <PageHeading title="Log in" description="Use your administrator account to access BizLeap." />
          <form ref={form} onSubmit={submit} noValidate>
            <fieldset disabled={pending} className="grid min-w-0 gap-4 lg:gap-5">
              <Field name="email" label="Email" type="email" autoComplete="username" value={values.email} onChange={change} error={fields.email} required />
              <Field
                name="password"
                label="Password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                value={values.password}
                onChange={change}
                error={fields.password}
                required
                trailing={(
                  <Tooltip label={toggleLabel} side="top-end">
                    <Button variant="ghost" compact aria-label={toggleLabel} onClick={() => setVisible(!visible)}>
                      {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </Button>
                  </Tooltip>
                )}
              />
            </fieldset>
            {error && <div className="mt-4"><FormError>{error}</FormError></div>}
            <Button type="submit" className="mt-6 h-12 w-full" busy={pending}>Log in</Button>
          </form>
        </div>
      </section>
    </main>
  )
}
