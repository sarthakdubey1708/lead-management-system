import { LoaderCircle } from 'lucide-react'

const variants = {
  primary: 'border-brand-700 bg-brand-600 text-white shadow-control enabled:hover:bg-brand-700 enabled:active:bg-brand-700',
  onDark: 'border-transparent bg-brand-200 text-navy-950 shadow-control enabled:hover:bg-brand-50 enabled:active:bg-brand-50',
  nav: 'border-transparent text-navy-200 enabled:hover:bg-white/10 enabled:hover:text-white enabled:active:bg-white/15',
  secondary: 'border-line-input bg-surface text-fg enabled:hover:border-brand-600 enabled:hover:bg-brand-50 enabled:active:bg-surface-muted',
  danger: 'border-transparent bg-error text-white shadow-control enabled:hover:brightness-[.92] enabled:active:brightness-[.92]',
  ghost: 'border-transparent text-fg-2 enabled:hover:bg-surface-muted enabled:active:bg-surface-muted',
}

export function Button({ variant = 'primary', icon: Icon, compact = false, busy = false, disabled, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex min-h-touch shrink-0 items-center justify-center gap-2 rounded-control border text-body font-semibold transition-[background-color,border-color,color,transform,filter] duration-fast ease-out enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:min-h-control ${compact ? 'min-w-11 px-2 md:min-w-10' : 'px-4'} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon aria-hidden="true" size={20} />}
      {children}
      {busy && <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />}
    </button>
  )
}

export function Tooltip({ label, side = 'top', children }) {
  const positions = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    'top-end': 'bottom-full right-0 mb-2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }

  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span aria-hidden="true" className={`pointer-events-none invisible absolute z-20 whitespace-nowrap rounded-control bg-ink-800 px-3 py-2 text-caption text-white shadow-pop group-hover/tooltip:visible group-focus-within/tooltip:visible ${positions[side]}`}>
        {label}
      </span>
    </span>
  )
}
