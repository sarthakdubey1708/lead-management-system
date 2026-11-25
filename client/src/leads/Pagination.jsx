import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { formatCount } from '../utils/format.js'

function pageNumbers(page, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const middle = Math.min(Math.max(page, 3), totalPages - 2)
  return [1, middle - 1, middle, middle + 1, totalPages]
}

export function Pagination({ pagination, loading, onPage }) {
  const { page, limit, total, totalPages } = pagination
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pages = pageNumbers(page, totalPages)

  function goTo(next) {
    if (!loading && next !== page && next >= 1 && next <= totalPages) onPage(next)
  }

  const unavailable = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

  return (
    <div className="desk-panel tabular flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:rounded-none md:rounded-b-card md:border-0 md:border-t md:shadow-none">
      <p className="text-fg-2">Showing {formatCount(from)}–{formatCount(to)} of {formatCount(total)}</p>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto md:flex-nowrap">
          <Button variant="ghost" className={unavailable} aria-disabled={loading || page === 1 || undefined} onClick={() => goTo(page - 1)}>
            <ChevronLeft aria-hidden="true" size={16} /> Previous
          </Button>
          <div className="order-last flex min-w-0 basis-full flex-wrap items-center justify-center gap-1 md:order-none md:basis-auto md:flex-nowrap">
            {pages.map((number, index) => (
              <span key={number} className="inline-flex items-center gap-1">
                {index > 0 && number - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-fg-3">…</span>}
                <Button
                  variant="ghost"
                  compact
                  aria-label={`Page ${number}`}
                  aria-current={page === number ? 'page' : undefined}
                  aria-disabled={loading || undefined}
                  className={`${unavailable} ${page === number ? 'bg-brand-50 !text-brand-600' : ''}`}
                  onClick={() => goTo(number)}
                >{formatCount(number)}</Button>
              </span>
            ))}
          </div>
          <Button variant="ghost" className={unavailable} aria-disabled={loading || page === totalPages || undefined} onClick={() => goTo(page + 1)}>
            Next <ChevronRight aria-hidden="true" size={16} />
          </Button>
        </nav>
      )}
    </div>
  )
}
