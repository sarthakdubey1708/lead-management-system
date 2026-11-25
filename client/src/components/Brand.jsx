import { Workflow } from 'lucide-react'

export function Brand({ compact = false, subtitle = false, inverse = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-control shadow-control ${inverse ? 'bg-brand-200 text-navy-950' : 'bg-brand-600 text-white'}`}>
        <Workflow aria-hidden="true" size={20} />
      </span>
      <div className={compact ? 'sr-only lg:not-sr-only' : 'min-w-0'}>
        <span className={`block text-h3 tracking-tight lg:text-h2 ${inverse ? 'text-white' : 'text-ink-800'}`}>BizLeap</span>
        {subtitle && <span className={`block text-caption ${inverse ? 'text-navy-200' : 'text-fg-3'}`}>Lead management</span>}
      </div>
    </div>
  )
}
