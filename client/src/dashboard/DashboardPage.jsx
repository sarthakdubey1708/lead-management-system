import { lazy, Suspense } from 'react'
import { ArrowRight, CircleCheck, ClipboardList, MessagesSquare, UserRoundPlus } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { Feedback, LoadError, Skeleton } from '../components/Feedback.jsx'
import { PageHeading } from '../components/PageHeading.jsx'
import { StatusBadge, StatusDot } from '../components/StatusBadge.jsx'
import { STATUS_STYLES } from '../utils/constants.js'
import { formatCount, formatDate } from '../utils/format.js'

const DashboardCharts = lazy(() => import('./DashboardCharts.jsx'))

const metricPanel = 'min-w-0 rounded-card p-4 shadow-card md:p-5'
const recentGrid = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_7rem_7rem]'
const pipelinePanel = 'min-w-0 border-t border-white/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0'

function Metrics({ summary }) {
  const conversion = summary.totalLeads ? summary.convertedLeads / summary.totalLeads * 100 : 0
  const metrics = [
    { label: 'Total leads', count: summary.totalLeads, icon: ClipboardList, surface: 'bg-accent-indigo-bg text-ink-800', iconStyle: 'bg-white/60 text-accent-indigo' },
    { label: 'New', count: summary.newLeads, icon: UserRoundPlus, surface: 'bg-accent-blue-bg text-ink-800', iconStyle: 'bg-white/60 text-accent-blue' },
    { label: 'Contacted', count: summary.contactedLeads, icon: MessagesSquare, surface: 'bg-accent-amber-bg text-ink-800', iconStyle: 'bg-white/60 text-accent-amber' },
    { label: 'Converted', count: summary.convertedLeads, icon: CircleCheck, surface: 'bg-gradient-to-br from-accent-emerald to-accent-emerald-deep text-white', iconStyle: 'bg-white/10 text-accent-emerald-bg', detail: `${conversion.toFixed(1)}% conversion rate` },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4" aria-label="Lead metrics">
      {metrics.map(({ label, count, icon: Icon, surface, iconStyle, detail }) => (
        <div key={label} className={`${metricPanel} ${surface}`}>
          <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-2">
            <h2 className="text-badge font-semibold md:text-body md:font-semibold">{label}</h2>
            <span className={`grid size-7 shrink-0 place-items-center rounded-control md:size-9 ${iconStyle}`}>
              <Icon aria-hidden="true" size={18} />
            </span>
          </div>
          <p className="tabular mt-2 break-words text-kpi tracking-tight md:text-kpi-wide">{formatCount(count)}</p>
          {detail && <p className="tabular mt-2 text-caption text-accent-emerald-bg">{detail}</p>}
        </div>
      ))}
    </section>
  )
}

function Pipeline({ byStatus }) {
  const visibleSegments = byStatus.filter(({ count }) => count > 0)
  return (
    <section aria-labelledby="pipeline-title" className={pipelinePanel}>
      <h2 id="pipeline-title" className="text-h3 text-white md:text-h2">Lead pipeline</h2>
      <div
        role="img"
        aria-label={byStatus.map(({ status, count }) => `${status}: ${formatCount(count)}`).join(', ')}
        className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full bg-navy-950"
      >
        {visibleSegments.map(({ status, count }) => (
          <span key={status} className={STATUS_STYLES[status].dot} style={{ flex: `${count} 1 0%` }} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3 md:grid-cols-5">
        {byStatus.map(({ status, count }) => (
          <li key={status} className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-h3 tabular text-white"><StatusDot status={status} /> {formatCount(count)}</span>
            <span className="block text-badge text-navy-200">{status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DashboardBanner({ summary }) {
  return (
    <div className="dashboard-banner brand-surface inverse-focus">
      <PageHeading
        title="Dashboard"
        inverse
        className="flex flex-wrap items-center justify-between gap-2 md:block"
        action={(
          <Link to="/leads" className="inline-flex min-h-touch items-center gap-2 rounded-control border border-white/20 bg-white/5 px-3 text-badge font-semibold text-brand-200 transition-[background-color,transform] duration-fast hover:bg-white/10 active:scale-[0.98] md:mt-4 md:min-h-control">
            View leads <ArrowRight aria-hidden="true" size={16} />
          </Link>
        )}
      />
      {summary.data ? <Pipeline byStatus={summary.data.byStatus} /> : summary.loading && (
        <div className={pipelinePanel} aria-hidden="true">
          <Skeleton className="h-6 w-32 !bg-white/15" />
          <Skeleton className="mt-3 h-3 !bg-white/15" />
          <Skeleton className="mt-4 h-8 w-full !bg-white/10" />
        </div>
      )}
    </div>
  )
}

function SummarySkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4 md:gap-5">
      <p role="status" className="sr-only">Loading dashboard summary</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className={`${metricPanel} bg-surface`} key={index}>
            <div className="flex items-center justify-between gap-1">
              <Skeleton className="h-4 w-16 max-w-full" />
              <Skeleton className="size-8 shrink-0 md:size-10" />
            </div>
            <Skeleton className="mt-2 h-8 w-12" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>
      <ChartSkeleton />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="dashboard-charts">
      {[true, false].map((dark) => (
        <div key={String(dark)} className={`desk-panel min-w-0 p-4 md:p-5 ${dark ? 'border-navy-800 bg-navy-900' : ''}`}>
          <Skeleton className={`h-6 w-32 ${dark ? '!bg-navy-800' : ''}`} />
          <Skeleton className={`mt-1 h-4 w-40 ${dark ? '!bg-navy-800' : ''}`} />
          <Skeleton className={`dashboard-chart-plot ${dark ? '!bg-navy-800' : ''}`} />
        </div>
      ))}
    </div>
  )
}

function RecentLeads({ recent, retry }) {
  return (
    <section aria-labelledby="recent-title" className="desk-panel">
      <header className="flex flex-wrap items-center justify-between gap-x-3 border-b border-line px-4 py-3 md:px-5">
        <h2 id="recent-title" className="text-h2 text-ink-800">Recent leads</h2>
        <Link to="/leads" className="inline-flex min-h-touch items-center gap-2 rounded-control px-2 font-semibold text-brand-600 transition-colors duration-fast hover:bg-brand-50 md:min-h-control">
          View all leads <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </header>
      {recent.error && <LoadError title="Could not load recent leads" error={recent.error} retry={retry} />}
      {recent.loading && !recent.data && (
        <div aria-busy="true">
          <p role="status" className="sr-only">Loading recent leads</p>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`${recentGrid} border-b border-line px-4 py-3 last:border-b-0 md:px-5`}>
              <div className="grid gap-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-36 max-w-full" /></div>
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="hidden h-4 w-20 md:block" />
            </div>
          ))}
        </div>
      )}
      {!recent.error && recent.data?.length === 0 && <Feedback title="No recent leads">New leads will appear here as they’re added.</Feedback>}
      {!!recent.data?.length && (
        <>
          <div aria-hidden="true" className={`${recentGrid} hidden bg-surface-muted px-5 py-2 text-caption text-fg-2 md:grid`}>
            <span>Lead</span><span>Company</span><span>Status</span><span>Created</span>
          </div>
          <ul className="divide-y divide-line tabular" aria-busy={recent.loading}>
            {recent.data.map((lead) => (
              <li className={`${recentGrid} border-line px-4 py-3 md:px-5`} key={lead._id}>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="font-semibold text-ink-800">{lead.fullName}</p>
                  <p className="text-body text-fg-3">{lead.email}</p>
                </div>
                <p className="col-start-1 row-start-2 min-w-0 text-fg-2 [overflow-wrap:anywhere] md:col-start-auto md:row-start-auto">{lead.companyName}</p>
                <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start"><StatusBadge status={lead.leadStatus} /></div>
                <time className="col-start-2 row-start-2 justify-self-end whitespace-nowrap text-fg-3 md:col-start-auto md:row-start-auto md:justify-self-start" dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export function DashboardPage() {
  const { summary, recent, refreshDashboard } = useOutletContext()
  return (
    <div className="grid gap-4 md:gap-5">
      <DashboardBanner summary={summary} />
      {summary.error && <div className="desk-panel"><LoadError title="Could not load the dashboard" error={summary.error} retry={refreshDashboard} /></div>}
      {summary.loading && !summary.data && <SummarySkeleton />}
      {summary.data && (
        <div className="grid gap-4 md:gap-5" aria-busy={summary.loading}>
          <Metrics summary={summary.data} />
          <Suspense fallback={<ChartSkeleton />}>
            <DashboardCharts trend={summary.data.leadsOverTime} sources={summary.data.bySource} />
          </Suspense>
        </div>
      )}
      <RecentLeads recent={recent} retry={refreshDashboard} />
    </div>
  )
}
