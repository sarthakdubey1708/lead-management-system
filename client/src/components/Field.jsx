import { useId } from 'react'
import { ChevronDown, CircleAlert } from 'lucide-react'

export function Field({ label, optional = false, error, options, leading: Leading, trailing, className = '', ...props }) {
  const id = useId()
  const control = {
    ...props,
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    className: `min-h-touch w-full min-w-0 rounded-control border px-3 text-fg transition-colors duration-fast placeholder:text-fg-3 disabled:opacity-50 md:min-h-control ${error ? 'border-error bg-error-bg/40 focus:bg-surface' : 'border-line-input bg-surface-hover hover:border-fg-3 focus:border-brand-600 focus:bg-surface'} ${Leading ? 'pl-10' : ''} ${options ? 'appearance-none pl-2 pr-6 md:pl-3 md:pr-8' : ''} ${trailing ? 'pr-12' : ''}`,
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-caption font-semibold text-fg-2 lg:text-badge lg:font-semibold">
        {label}{optional && <span className="font-medium text-fg-3"> (optional)</span>}
        {props.required && <span aria-hidden="true" className="text-brand-600"> *</span>}
      </label>
      <div className="group relative">
        {Leading && <Leading aria-hidden="true" size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-fg-3 group-focus-within:text-brand-600" />}
        {options ? (
          <>
            <select {...control}>
              {options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute inset-y-0 right-2 my-auto text-fg-3 group-focus-within:text-brand-600 md:right-3" />
          </>
        ) : <input {...control} />}
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 flex gap-2 text-body text-error">
          <CircleAlert aria-hidden="true" size={16} className="mt-1 shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="flex items-start gap-2 rounded-control border border-error/20 border-l-2 border-l-error bg-error-bg p-3 text-body text-error">
      <CircleAlert size={16} aria-hidden="true" className="mt-1 shrink-0" /> {children}
    </p>
  )
}
