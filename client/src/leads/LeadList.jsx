import { Pencil, Trash2 } from 'lucide-react'
import { Button, Tooltip } from '../components/Button.jsx'
import { Skeleton } from '../components/Feedback.jsx'
import { formatDate } from '../utils/format.js'
import { StatusMenu } from './StatusMenu.jsx'

const tableHeader = 'border-y border-line bg-surface-muted text-left text-badge text-fg-2'
const tableCell = 'lead-cell'
const wrap = 'min-w-0 [overflow-wrap:anywhere]'

function LeadIdentity({ lead }) {
  return (
    <div className={wrap}>
      <p className="font-semibold text-ink-800">{lead.fullName}</p>
      <p className="text-body text-fg-3 lg:leading-5">{lead.email}</p>
    </div>
  )
}

function LeadDate({ lead, className }) {
  const label = formatDate(lead.createdAt)
  return <time className={className} dateTime={lead.createdAt} title={label}>{label}</time>
}

function LeadActions({ lead, busy, onOpen, mobile = false }) {
  return (
    <div className={mobile ? 'grid grid-cols-2 gap-2' : 'flex items-center justify-end'}>
      {[
        { kind: 'edit', title: 'Edit', icon: Pencil },
        { kind: 'delete', title: 'Delete', icon: Trash2 },
      ].map(({ kind, title, icon: Icon }) => {
        const button = (
          <Button
            variant="ghost"
            compact={!mobile}
            aria-disabled={busy || undefined}
            className={`aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${mobile ? 'w-full bg-surface-hover' : ''} ${kind === 'delete' ? 'enabled:hover:!bg-error-bg enabled:hover:!text-error' : ''}`}
            aria-label={`${title} ${lead.fullName}`}
            onClick={(event) => { if (!busy) onOpen(kind, lead, event.currentTarget) }}
          >
            <Icon aria-hidden="true" size={16} />
            {mobile && title}
          </Button>
        )
        return mobile ? <span key={kind}>{button}</span> : <Tooltip key={kind} label={title}>{button}</Tooltip>
      })}
    </div>
  )
}

function LeadTable({ leads, busy, updating, onStatusChange, onOpen }) {
  return (
    <div className="lead-table-frame hidden md:block">
      <table className="lead-table tabular w-full table-fixed" aria-busy={busy}>
        <caption className="sr-only">Lead records, newest first</caption>
        <thead className={tableHeader}>
          <tr>
            <th scope="col" className={`${tableCell} w-[34%] lg:w-auto`}>Lead</th>
            <th scope="col" className={`${tableCell} lead-company-column`}>Company</th>
            <th scope="col" className={`${tableCell} lead-phone-column hidden lg:table-cell`}>Phone</th>
            <th scope="col" className={`${tableCell} w-[18%] lg:w-[12%]`}>Source</th>
            <th scope="col" className="w-[7.5rem] px-2 py-3 lg:py-2">Status</th>
            <th scope="col" className={`${tableCell} lead-date-column hidden lg:table-cell`}>Created</th>
            <th scope="col" className="w-[5.5rem] px-2 py-3 text-right lg:py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {leads.map((lead) => (
            <tr key={lead._id} className="border-line transition-colors duration-fast hover:bg-brand-50/65">
              <td className={tableCell}>
                <LeadIdentity lead={lead} />
                <p className="mt-1 flex flex-wrap gap-x-2 text-badge text-fg-3 lg:hidden">
                  <span className="max-w-full truncate" title={lead.phone}>{lead.phone}</span>
                  <LeadDate lead={lead} className="whitespace-nowrap" />
                </p>
              </td>
              <td className={`${tableCell} ${wrap}`}>{lead.companyName}</td>
              <td className={`${tableCell} hidden whitespace-nowrap lg:table-cell`}><span className="block truncate" title={lead.phone}>{lead.phone}</span></td>
              <td className={`${tableCell} ${wrap}`}>{lead.leadSource}</td>
              <td className="px-2 py-3 align-middle lg:py-1">
                <StatusMenu lead={lead} busy={updating.has(lead._id)} blocked={busy} onChange={onStatusChange} />
              </td>
              <td className={`${tableCell} hidden whitespace-nowrap text-fg-3 lg:table-cell`}><LeadDate lead={lead} /></td>
              <td className="px-1 py-3 lg:py-1"><LeadActions lead={lead} busy={busy || updating.has(lead._id)} onOpen={onOpen} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeadCards({ leads, busy, updating, onStatusChange, onOpen }) {
  return (
    <ul className="tabular grid gap-3 md:hidden" aria-label="Lead records, newest first" aria-busy={busy}>
      {leads.map((lead) => (
        <li key={lead._id} className="desk-panel min-w-0">
          <div className="flex items-center justify-between gap-2 rounded-t-card border-b border-line bg-surface-muted px-4 py-3">
            <LeadIdentity lead={lead} />
            <StatusMenu lead={lead} busy={updating.has(lead._id)} blocked={busy} onChange={onStatusChange} alignEnd />
          </div>
          <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 p-4">
            <div className={wrap}><dt className="text-caption text-fg-3">Company</dt><dd>{lead.companyName}</dd></div>
            <div className="min-w-0"><dt className="text-caption text-fg-3">Phone</dt><dd className="truncate" title={lead.phone}>{lead.phone}</dd></div>
            <div className={wrap}><dt className="text-caption text-fg-3">Source</dt><dd>{lead.leadSource}</dd></div>
            <div className="min-w-0"><dt className="text-caption text-fg-3">Created</dt><dd className="whitespace-nowrap"><LeadDate lead={lead} /></dd></div>
          </dl>
          <div className="border-t border-line px-4 py-2">
            <LeadActions lead={lead} busy={busy || updating.has(lead._id)} onOpen={onOpen} mobile />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function LeadRecords(props) {
  return (
    <>
      <LeadTable {...props} />
      <LeadCards {...props} />
    </>
  )
}

export function LeadListSkeleton({ count }) {
  return (
    <div aria-busy="true" className="grid gap-3 md:gap-0">
      <div className="hidden border-t border-line bg-surface-muted px-4 py-3 md:block"><Skeleton className="h-4 w-24 bg-line" /></div>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="grid grid-cols-2 items-center gap-4 rounded-card border border-line bg-surface p-4 md:grid-cols-5 md:rounded-none md:border-x-0 md:border-b-0 md:p-3">
          <div className="col-span-2 grid gap-1 md:col-span-1">
            <Skeleton className="h-4 w-24 max-w-full" />
            <Skeleton className="h-4 w-32 max-w-full" />
          </div>
          <Skeleton className="h-4 w-20 max-w-full" />
          <Skeleton className="h-4 w-20 max-w-full" />
          <Skeleton className="h-6 w-24 max-w-full" />
          <Skeleton className="h-6 w-16 max-w-full" />
        </div>
      ))}
    </div>
  )
}
