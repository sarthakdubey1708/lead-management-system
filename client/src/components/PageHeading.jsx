export function SkipLink() {
  return (
    <a href="#main-content" className="sr-only z-50 rounded-control bg-surface px-4 py-3 font-semibold text-brand-600 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Skip to main content
    </a>
  )
}

export function PageHeading({ title, description, action, inverse = false, className = 'mb-6 flex flex-wrap items-start justify-between gap-4' }) {
  return (
    <header className={className}>
      <div className="min-w-0">
        <h1 tabIndex={-1} className={`text-h1 tracking-tight md:text-h1-wide ${inverse ? 'text-white' : 'text-ink-800'}`}>{title}</h1>
        {description && <p className={`mt-1 text-body ${inverse ? 'text-navy-200' : 'text-fg-3'}`}>{description}</p>}
      </div>
      {action}
    </header>
  )
}
