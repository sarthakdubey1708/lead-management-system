import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { Button } from './Button.jsx'
import { ToastContext } from './toast-context.js'

function Toast({ toast, dismiss }) {
  const { id, message, error } = toast
  const Icon = error ? CircleAlert : CircleCheck

  useEffect(() => {
    if (error) return
    const timeout = window.setTimeout(() => dismiss(id), 4000)
    return () => window.clearTimeout(timeout)
  }, [dismiss, error, id])

  return (
    <div className={`pointer-events-auto flex animate-toast-in items-center gap-3 rounded-card border border-line border-l-4 bg-surface p-2 pl-3 shadow-pop ${error ? 'border-l-error' : 'border-l-success'}`}>
      <span className={`grid size-8 shrink-0 place-items-center rounded-control ${error ? 'bg-error-bg text-error' : 'bg-success-bg text-success'}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <p role={error ? 'alert' : 'status'} className="min-w-0 flex-1 text-body font-medium text-ink-800 [overflow-wrap:anywhere]">{message}</p>
      <Button variant="ghost" compact aria-label="Dismiss notification" onClick={() => dismiss(id)}>
        <X aria-hidden="true" size={16} />
      </Button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const notify = useCallback((message, { error = false } = {}) => {
    const toast = { id: nextId.current++, message, error }
    setToasts((current) => [...current.slice(-2), toast])
  }, [])
  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-offset pointer-events-none fixed inset-x-4 z-40 grid gap-2 md:left-auto md:right-6 md:top-6 md:w-80" aria-label="Notifications">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} dismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}
