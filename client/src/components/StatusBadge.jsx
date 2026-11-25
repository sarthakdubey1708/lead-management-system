import { STATUS_STYLES } from '../utils/constants.js'

export function StatusDot({ status }) {
  return <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${STATUS_STYLES[status].dot}`} />
}

export function StatusBadge({ status, children }) {
  return (
    <span className={`inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-badge shadow-[inset_0_0_0_1px_color-mix(in_srgb,currentColor_16%,transparent)] ${STATUS_STYLES[status].badge}`}>
      <StatusDot status={status} />
      {status}
      {children}
    </span>
  )
}
