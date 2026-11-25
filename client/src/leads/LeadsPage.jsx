import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useResource } from '../api/useResource.js'
import { useAuth } from '../auth/auth-context.js'
import { Button } from '../components/Button.jsx'
import { Feedback, LoadError } from '../components/Feedback.jsx'
import { Field } from '../components/Field.jsx'
import { PageHeading } from '../components/PageHeading.jsx'
import { useToast } from '../components/toast-context.js'
import { SOURCES, STATUSES, toOptions } from '../utils/constants.js'
import { formatCount } from '../utils/format.js'
import { leadPayload } from '../utils/validation.js'
import { DeleteLead, LeadForm } from './LeadDialogs.jsx'
import { LeadListSkeleton, LeadRecords } from './LeadList.jsx'
import { Pagination } from './Pagination.jsx'
import { updateCurrentLead } from './update-current-lead.js'

const pageSize = 10
const defaultQuery = { search: '', status: '', source: '', page: 1 }
const statusOptions = [{ value: '', label: 'All statuses' }, ...toOptions(STATUSES)]
const sourceOptions = [{ value: '', label: 'All sources' }, ...toOptions(SOURCES)]
const workspacePanel = 'desk-panel md:rounded-none md:border-0 md:bg-transparent md:shadow-none'

export function LeadsPage() {
  const { request } = useAuth()
  const { revision: sharedRevision, refreshDashboard, updating, beginStatusUpdate, finishStatusUpdate } = useOutletContext()
  const notify = useToast()
  const returnFocus = useRef(null)
  const getReturnFocus = useCallback(() => returnFocus.current, [])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState(defaultQuery)
  const [revision, setRevision] = useState(0)
  const [dialog, setDialog] = useState(null)

  const load = useCallback(async (signal) => {
    const params = new URLSearchParams({ page: query.page, limit: pageSize })
    for (const field of ['search', 'status', 'source']) {
      if (query[field]) params.set(field, query[field])
    }
    const result = await request(`/leads?${params}`, { signal })
    const lastPage = Math.max(1, result.pagination.totalPages)
    if (result.pagination.page <= lastPage) return result

    // A deletion elsewhere can leave the current page outside the available range.
    params.set('page', lastPage)
    return request(`/leads?${params}`, { signal })
  }, [query, request])

  const list = useResource(load, revision + sharedRevision)
  const pendingSearch = search.trim() !== query.search
  const busy = list.loading || pendingSearch
  const filtered = Boolean(query.search || query.status || query.source)
  const empty = !busy && !list.error && list.data?.data.length === 0
  const pagination = list.data?.pagination ?? (list.loading ? list.previousData?.pagination : null)

  useEffect(() => {
    if (!pendingSearch) return
    const timeout = window.setTimeout(() => {
      setQuery((current) => ({ ...current, search: search.trim(), page: 1 }))
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [pendingSearch, search])

  function filter(event) {
    const { name, value } = event.target
    setQuery((current) => ({ ...current, [name]: value, page: 1 }))
  }

  function openDialog(kind, lead, opener) {
    returnFocus.current = opener
    setDialog({ kind, lead })
  }

  function closeDialog() {
    setDialog(null)
  }

  function refreshList() {
    setRevision((current) => current + 1)
  }

  async function updateLead(original, payloadFor, conflictMessage) {
    let saved
    try {
      saved = await updateCurrentLead(request, original, payloadFor)
    } catch (error) {
      if (error.status === 404) refreshDashboard()
      throw error
    }

    refreshDashboard()
    if (!saved) throw new Error(conflictMessage)
  }

  async function saveLead(body) {
    const lead = dialog.lead
    if (lead) {
      await updateLead(lead, () => body, 'This lead changed while you were editing. Your draft is still here. Close and reopen the form to review the latest version before retrying.')
    } else {
      await request('/leads', { method: 'POST', body })
      if (!filtered && query.page !== 1) setQuery(defaultQuery)
      refreshDashboard()
    }
    closeDialog()
    notify(lead ? 'Lead updated.' : 'Lead added.')
  }

  async function deleteLead() {
    await request(`/leads/${dialog.lead._id}`, { method: 'DELETE' })
    const { total, page, limit } = list.data.pagination
    const lastPage = Math.max(1, Math.ceil((total - 1) / limit))
    if (page > lastPage) setQuery((current) => ({ ...current, page: lastPage }))
    returnFocus.current = document.querySelector('main h1')
    refreshDashboard()
    closeDialog()
    notify('Lead deleted.')
  }

  async function changeStatus(lead, status) {
    if (!beginStatusUpdate(lead._id)) return
    const trigger = document.activeElement
    try {
      await updateLead(
        lead,
        (latest) => leadPayload({ ...latest, leadStatus: status }),
        'This lead changed since it was loaded. The list is refreshing. Please retry the status change.',
      )
      if (query.status && query.status !== status && trigger === document.activeElement) {
        document.querySelector('main h1')?.focus({ preventScroll: true })
      }
      notify(`Status updated to ${status}.`)
    } catch (error) {
      if (error.status !== 401) notify(error.message, { error: true })
    } finally {
      finishStatusUpdate(lead._id)
    }
  }

  const addLead = <Button variant={empty && !filtered ? 'primary' : 'onDark'} icon={Plus} onClick={(event) => openDialog('add', null, event.currentTarget)}>Add lead</Button>
  const resultsLabel = busy ? 'Loading leads' : list.data ? `${formatCount(list.data.pagination.total)} ${list.data.pagination.total === 1 ? 'lead' : 'leads'} found` : ''

  return (
    <>
      <PageHeading
        title="Leads"
        inverse
        description={<span role="status" aria-live="polite" className="tabular">{resultsLabel}</span>}
        action={empty && !filtered ? null : addLead}
        className="brand-surface inverse-focus mb-4 flex flex-wrap items-center justify-between gap-3 rounded-hero p-4 shadow-card md:p-6 lg:mb-3 lg:py-3"
      />
      <div className="lead-workspace grid gap-4 md:gap-0">
        <section aria-label="Lead filters" className={`${workspacePanel} grid grid-cols-2 items-end gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)_minmax(10rem,0.55fr)] md:gap-4 md:p-5 lg:py-3`}>
          <Field
            label="Search leads"
            name="search"
            type="search"
            leading={Search}
            placeholder="Name, email, phone, company"
            maxLength={100}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="col-span-2 md:col-span-1"
          />
          <Field label="Status" name="status" value={query.status} options={statusOptions} onChange={filter} />
          <Field label="Source" name="source" value={query.source} options={sourceOptions} onChange={filter} />
        </section>

        {list.error && <div className={workspacePanel}><LoadError title="Could not load leads" error={list.error} retry={refreshList} /></div>}
        {list.loading && !list.data && <LeadListSkeleton count={list.previousData?.data.length || pageSize} />}
        {empty && (
          <div className={workspacePanel}>
            {filtered ? (
              <Feedback title="No leads match" action={(
                <Button variant="secondary" onClick={() => { setSearch(''); setQuery(defaultQuery) }}>Clear filters</Button>
              )}>Try a different search or clear your filters.</Feedback>
            ) : <Feedback title="No leads yet" action={addLead}>Add a lead to start building your pipeline.</Feedback>}
          </div>
        )}
        {!!list.data?.data.length && (
          <LeadRecords leads={list.data.data} busy={busy || Boolean(list.error)} updating={updating} onStatusChange={changeStatus} onOpen={openDialog} />
        )}
        {!!pagination?.total && (
          <Pagination pagination={pagination} loading={busy} onPage={(page) => setQuery((current) => ({ ...current, page }))} />
        )}
      </div>
      {dialog?.kind === 'delete' && <DeleteLead lead={dialog.lead} getReturnFocus={getReturnFocus} onClose={closeDialog} onDelete={deleteLead} />}
      {(dialog?.kind === 'add' || dialog?.kind === 'edit') && <LeadForm lead={dialog.lead} getReturnFocus={getReturnFocus} onClose={closeDialog} onSave={saveLead} />}
    </>
  )
}
