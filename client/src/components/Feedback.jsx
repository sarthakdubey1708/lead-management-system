import { CircleAlert, Inbox, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button.jsx'

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-control bg-surface-muted/80 ${className}`} />
}

export function LoadingLabel({ children }) {
  return (
    <p role="status" className="flex items-center gap-2 text-body text-fg-3">
      <LoaderCircle aria-hidden="true" size={16} className="animate-spin text-brand-600" /> {children}
    </p>
  )
}

export function Feedback({ title, children, action, error = false }) {
  const Icon = error ? CircleAlert : Inbox
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center md:py-12">
      <span className={`mb-3 flex size-12 items-center justify-center rounded-card ring-1 ring-inset ${error ? 'bg-error-bg text-error ring-error/10' : 'bg-accent-indigo-bg text-accent-indigo ring-accent-indigo/10'}`}>
        <Icon aria-hidden="true" size={20} />
      </span>
      <div role={error ? 'alert' : undefined} className="max-w-sm">
        <h2 className="text-h2 text-ink-800">{title}</h2>
        <p className="mt-1 text-body text-fg-3">{children}</p>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadError({ title, error, retry }) {
  return (
    <Feedback title={title} error action={<Button variant="secondary" icon={RefreshCw} onClick={retry}>Try again</Button>}>
      {error.message ?? error}
    </Feedback>
  )
}
