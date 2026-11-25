import { useId, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button.jsx'

const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]'

export function Dialog({ title, description, getReturnFocus, onClose, pending, dirty = false, sheet = false, children, footer }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    dialog.querySelector('[data-initial-focus]')?.focus()

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      const opener = getReturnFocus()
      const target = opener?.isConnected && opener.getClientRects().length ? opener : document.querySelector('main h1')
      target?.focus({ preventScroll: true })
    }
  }, [getReturnFocus])

  function trapTab(event) {
    if (event.key !== 'Tab') return
    const controls = [...dialogRef.current.querySelectorAll(focusableSelector)]
    const first = controls[0]
    const last = controls.at(-1)
    if (!first || (event.shiftKey && (event.target === first || event.target === dialogRef.current))) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      role={sheet ? 'dialog' : 'alertdialog'}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending && !dirty) onClose()
      }}
      onKeyDown={trapTab}
      className={sheet
        ? 'm-0 h-[100dvh] max-h-none w-full max-w-none animate-sheet-in overflow-hidden rounded-t-modal border-t-4 border-brand-600 bg-surface text-fg shadow-pop backdrop:bg-ink-800/40 md:m-auto md:h-fit md:max-h-[calc(100dvh-3rem)] md:max-w-modal md:animate-modal-in md:rounded-modal'
        : 'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm animate-modal-in rounded-modal border-t-4 border-error bg-surface text-fg shadow-pop backdrop:bg-ink-800/40'}
    >
      <div className={sheet ? 'flex h-full max-h-[inherit] flex-col md:h-auto' : ''}>
        <header className={`flex shrink-0 items-start justify-between gap-3 border-b border-line bg-surface-hover px-4 py-3 md:px-6 ${sheet ? 'sheet-header' : ''}`}>
          <h2 id={titleId} className="min-w-0 self-center text-h2 text-ink-800 [overflow-wrap:anywhere]">{title}</h2>
          <Button variant="ghost" compact disabled={pending} aria-label="Close dialog" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </Button>
        </header>
        <div className={sheet ? 'min-h-0 flex-1 overflow-y-auto p-4 md:p-6' : 'p-4 md:p-6'}>
          <p id={descriptionId} className={`text-body text-fg-3 [overflow-wrap:anywhere] ${sheet ? 'mb-4' : ''}`}>{description}</p>
          {children}
        </div>
        <footer className={`shrink-0 justify-end gap-2 border-t border-line bg-surface-hover px-4 pt-4 md:px-6 md:pb-4 ${sheet ? 'safe-sheet-footer grid grid-cols-2 md:flex' : 'flex flex-wrap pb-4'}`}>
          {footer}
        </footer>
      </div>
    </dialog>
  )
}
