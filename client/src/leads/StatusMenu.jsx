import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Check, ChevronDown, LoaderCircle } from 'lucide-react'
import { StatusBadge, StatusDot } from '../components/StatusBadge.jsx'
import { STATUSES } from '../utils/constants.js'

export function StatusMenu({ lead, busy, blocked, onChange, alignEnd = false }) {
  const container = useRef(null)
  const trigger = useRef(null)
  const items = useRef([])
  const menuId = useId()
  const [placement, setPlacement] = useState(null)
  const open = placement !== null
  const unavailable = busy || blocked
  const currentIndex = STATUSES.indexOf(lead.leadStatus)

  useLayoutEffect(() => {
    if (open) items.current[currentIndex]?.focus()
  }, [currentIndex, open])

  useEffect(() => {
    if (!open) return
    function dismiss(event) {
      if (!container.current.contains(event.target)) setPlacement(null)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  function showMenu() {
    const rect = trigger.current.getBoundingClientRect()
    const roomBelow = window.innerHeight - rect.bottom - 12
    const roomAbove = rect.top - 12
    const menuHeight = window.matchMedia('(max-width: 767px)').matches ? 230 : 210
    const above = roomBelow < menuHeight && roomAbove > roomBelow
    setPlacement({ above, maxHeight: Math.max(44, above ? roomAbove : roomBelow) })
  }

  function closeMenu({ restore = true } = {}) {
    if (restore) trigger.current.focus({ preventScroll: true })
    setPlacement(null)
  }

  function choose(status) {
    closeMenu()
    if (status !== lead.leadStatus && !unavailable) onChange(lead, status)
  }

  function navigate(event, index) {
    const { key } = event
    if (key === 'Tab') {
      // Start the browser's normal tab traversal at the menu button.
      closeMenu()
      return
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      choose(STATUSES[index])
      return
    }
    const last = STATUSES.length - 1
    const targets = { ArrowDown: Math.min(index + 1, last), ArrowUp: Math.max(index - 1, 0), Home: 0, End: last }
    if (Object.hasOwn(targets, key)) {
      event.preventDefault()
      items.current[targets[key]]?.focus()
    } else if (key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
    }
  }

  return (
    <div ref={container} className="relative inline-flex shrink-0" onBlur={(event) => {
      if (open && !event.currentTarget.contains(event.relatedTarget)) closeMenu({ restore: false })
    }}>
      <button
        ref={trigger}
        type="button"
        aria-label={`Status for ${lead.fullName}: ${lead.leadStatus}. Change status`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-disabled={unavailable || undefined}
        aria-busy={busy || undefined}
        className="inline-flex min-h-touch items-center rounded-control transition-transform duration-fast active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 md:min-h-10 [&>span]:transition-[filter] [&>span]:duration-fast hover:[&>span]:brightness-95 aria-expanded:[&>span]:brightness-95"
        onClick={() => {
          if (!unavailable) {
            if (open) closeMenu()
            else showMenu()
          }
        }}
        onKeyDown={(event) => {
          if (['ArrowDown', 'Enter', ' '].includes(event.key) && !unavailable && !open) {
            event.preventDefault()
            showMenu()
          }
        }}
      >
        <StatusBadge status={lead.leadStatus}>
          {busy ? <LoaderCircle size={14} aria-hidden="true" className="animate-spin" /> : <ChevronDown size={14} aria-hidden="true" />}
        </StatusBadge>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Change status for ${lead.fullName}`}
          style={{ maxHeight: placement.maxHeight }}
          className={`absolute z-30 w-40 animate-modal-in overflow-y-auto rounded-card border border-line bg-surface p-1 shadow-pop ${alignEnd ? 'right-0' : 'left-0'} ${placement.above ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          {STATUSES.map((status, index) => (
            <button
              key={status}
              ref={(item) => { items.current[index] = item }}
              type="button"
              role="menuitemradio"
              aria-checked={status === lead.leadStatus}
              tabIndex={-1}
              className="flex min-h-touch w-full items-center gap-2 rounded-control px-2 text-body transition-colors duration-fast focus-visible:bg-surface-hover focus-visible:outline-offset-[-2px] aria-checked:bg-brand-50 aria-checked:font-semibold hover:bg-surface-hover active:scale-[0.98] md:min-h-control"
              onKeyDown={(event) => navigate(event, index)}
              onClick={() => choose(status)}
            >
              <StatusDot status={status} /> {status}
              {status === lead.leadStatus && <Check aria-hidden="true" size={16} className="ml-auto text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
