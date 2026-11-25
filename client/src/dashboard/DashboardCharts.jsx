import { useId } from 'react'
import {
  Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { formatCount, formatDate, formatTrendDate } from '../utils/format.js'

const axisStyle = { fill: 'var(--chart-text)', fontSize: 12, className: 'chart-axis-label' }
const darkAxisStyle = { ...axisStyle, fill: 'var(--chart-dark-text)' }
const sourceColors = {
  Website: 'var(--accent-indigo)',
  Instagram: 'var(--accent-blue)',
  LinkedIn: 'var(--accent-violet)',
  Referral: 'var(--accent-emerald)',
  Advertisement: 'var(--accent-amber)',
  'Cold Calling': 'var(--accent-coral)',
}

function ChartTip({ active, payload, total }) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null

  const title = row.date ? `${formatDate(`${row.date}T00:00:00Z`)} (UTC)` : row.source
  const color = row.date ? 'var(--chart-brand)' : sourceColors[row.source]
  return (
    <div className="rounded-card border border-line bg-surface px-3 py-2 text-badge shadow-pop">
      <p className="font-semibold text-ink-800">{title}</p>
      <p className="tabular mt-1 flex items-center gap-2 text-fg-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        {formatCount(row.count)} {row.count === 1 ? 'lead' : 'leads'}
      </p>
      {total > 0 && <p className="mt-1 text-caption text-fg-3">{(row.count / total * 100).toFixed(1)}% of all leads</p>}
    </div>
  )
}

function ChartCard({ id, title, subtitle, range, empty, rows, labelField, dark = false, keyboardAccessible = false, children }) {
  return (
    <section aria-labelledby={id} className={`min-w-0 p-4 md:p-5 ${dark ? 'rounded-card border border-navy-800 bg-gradient-to-br from-navy-900 to-navy-850 shadow-card' : 'desk-panel'}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div>
          <h2 id={id} className={`text-h2 ${dark ? 'text-white' : 'text-ink-800'}`}>{title}</h2>
          <p className={`mt-1 text-caption ${dark ? 'text-navy-200' : 'text-fg-3'}`}>{subtitle}</p>
        </div>
        {range && <p className="tabular rounded-control border border-white/15 bg-white/5 px-2 py-1 text-caption text-navy-100">{range}</p>}
      </header>
      {empty ? (
        <div className={`dashboard-chart-plot grid place-items-center rounded-control border border-dashed px-4 text-center text-body ${dark ? 'border-white/15 bg-navy-950 text-navy-200' : 'border-line-strong bg-surface-hover text-fg-3'}`}>{empty}</div>
      ) : (
        <>
          <div aria-hidden={!keyboardAccessible || undefined} className={`dashboard-chart-plot ${dark ? 'inverse-focus' : ''}`}>{children}</div>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead><tr><th scope="col">{labelField === 'date' ? 'UTC date' : 'Source'}</th><th scope="col">Leads</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[labelField]}><th scope="row">{row[labelField]}</th><td>{formatCount(row.count)}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function LeadTrend({ rows }) {
  const gradient = useId()
  const peak = Math.max(0, ...rows.map(({ count }) => count))
  const axisWidth = Math.max(28, formatCount(peak).length * 8 + 12)
  const range = rows.length ? `${formatTrendDate(rows[0].date)} – ${formatTrendDate(rows.at(-1).date)}` : null
  return (
    <ChartCard id="lead-trend" title="Lead activity" subtitle="Daily leads · Last 30 days (UTC)" range={range} empty={!peak && 'No leads were added in the last 30 days.'} rows={rows} labelField="date" dark keyboardAccessible>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
        <BarChart data={rows} accessibilityLayer aria-labelledby="lead-trend" desc="Use the Left and Right arrow keys to read daily lead counts." barCategoryGap="24%" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-aqua)" />
              <stop offset="100%" stopColor="var(--chart-teal)" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-dark-grid)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatTrendDate} tick={darkAxisStyle} tickLine={false} axisLine={{ stroke: 'var(--chart-dark-grid)' }} interval="preserveStartEnd" minTickGap={24} tickMargin={10} />
          <YAxis allowDecimals={false} domain={[0, Math.max(3, peak)]} tickCount={4} tickFormatter={formatCount} tick={darkAxisStyle} tickLine={false} axisLine={false} width={axisWidth} tickMargin={8} />
          <Tooltip cursor={{ fill: 'var(--chart-dark-grid)' }} content={<ChartTip />} isAnimationActive={false} />
          <Bar dataKey="count" fill={`url(#${gradient})`} maxBarSize={16} radius={[4, 4, 0, 0]} activeBar={{ fill: 'var(--chart-aqua)' }} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function LeadSources({ rows }) {
  const peak = Math.max(0, ...rows.map(({ count }) => count))
  const total = rows.reduce((sum, { count }) => sum + count, 0)
  return (
    <ChartCard id="lead-sources" title="Leads by source" subtitle="Lead counts across all dates" empty={!peak && 'No sources to show yet.'} rows={rows} labelField="source">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(3ch,max-content)] gap-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
          <BarChart layout="vertical" data={rows} accessibilityLayer={false} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, peak]} hide />
            <YAxis type="category" dataKey="source" tick={axisStyle} width={102} tickLine={false} axisLine={false} tickMargin={8} interval={0} />
            <Tooltip shared cursor={{ fill: 'var(--chart-tint)', fillOpacity: 0.65 }} content={<ChartTip total={total} />} isAnimationActive={false} />
            <Bar dataKey="count" barSize={14} radius={6} isAnimationActive={false} background={{ fill: 'var(--chart-track)', radius: 6 }}
              shape={(props) => <Rectangle {...props} fill={sourceColors[props.payload.source]} />} />
          </BarChart>
        </ResponsiveContainer>
        <div className="source-counts grid items-center text-right text-badge text-ink-800 tabular" style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}>
          {rows.map(({ source, count }) => <span key={source}>{formatCount(count)}</span>)}
        </div>
      </div>
    </ChartCard>
  )
}

export default function DashboardCharts({ trend, sources }) {
  return (
    <div className="dashboard-charts">
      <LeadTrend rows={trend} />
      <LeadSources rows={sources} />
    </div>
  )
}
