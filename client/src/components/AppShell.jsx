import { useCallback, useRef, useState } from 'react'
import { LayoutDashboard, LogOut, UsersRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useResource } from '../api/useResource.js'
import { useAuth } from '../auth/auth-context.js'
import { Brand } from './Brand.jsx'
import { Button, Tooltip } from './Button.jsx'
import { useToast } from './toast-context.js'

const destinations = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: UsersRound },
]

function Navigation({ mobile = false }) {
  return (
    <nav aria-label="Main navigation" className={mobile
      ? 'safe-bottom-nav inverse-focus fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-navy-950 md:hidden'
      : 'grid gap-1 px-2 lg:px-3'}>
      {destinations.map(({ to, label, icon: Icon }) => {
        const link = (
          <NavLink
            to={to}
            end
            aria-label={label}
            className={({ isActive }) => `relative inline-flex min-h-touch items-center justify-center gap-1 transition-[background-color,color,transform] duration-fast active:scale-[0.98] ${mobile
              ? 'w-1/2 flex-col text-caption focus-visible:outline-offset-[-3px]'
              : 'w-full rounded-card text-body font-medium lg:justify-start lg:gap-3 lg:px-3 lg:text-h3'} ${isActive
              ? `bg-brand-800 font-semibold text-brand-200 before:absolute before:bg-brand-200 ${mobile ? 'before:inset-x-4 before:top-0 before:h-0.5' : 'ring-1 ring-inset ring-brand-200/15 before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full'}`
              : 'text-navy-200 hover:bg-white/10 hover:text-white'}`}
          >
            <Icon aria-hidden="true" size={20} />
            <span className={mobile ? '' : 'sr-only lg:not-sr-only'}>{label}</span>
          </NavLink>
        )
        return mobile ? <span key={to} className="contents">{link}</span> : (
          <div key={to} className="rail-link"><Tooltip label={label} side="right">{link}</Tooltip></div>
        )
      })}
    </nav>
  )
}

function UserIdentity({ user, mobile }) {
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => [...part][0]).join('').toUpperCase()
  return (
    <div className="flex min-w-0 items-center gap-2 lg:gap-3" aria-label={`${user.name}, ${user.email}`}>
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-caption font-semibold text-brand-200 ring-1 ring-inset ring-brand-200/20">{initials}</span>
      <div className={`min-w-0 flex-1 ${mobile ? '' : 'sr-only lg:not-sr-only'}`}>
        <p className={`text-body font-semibold text-white ${mobile ? 'truncate' : '[overflow-wrap:anywhere]'}`} title={user.name}>{user.name}</p>
        {!mobile && <p className="truncate text-caption text-navy-200" title={user.email}>{user.email}</p>}
      </div>
    </div>
  )
}

export function AppShell() {
  const { session, request, logout } = useAuth()
  const notify = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [revision, setRevision] = useState(0)
  const statusWrites = useRef(new Set())
  const [updating, setUpdating] = useState(() => new Set())
  const refreshDashboard = useCallback(() => setRevision((current) => current + 1), [])
  const loadSummary = useCallback(async (signal) => (await request('/dashboard/summary', { signal })).data, [request])
  const loadRecent = useCallback(async (signal) => (await request('/leads?limit=5', { signal })).data, [request])
  const summary = useResource(loadSummary, revision)
  const recent = useResource(loadRecent, revision)

  function beginStatusUpdate(id) {
    if (statusWrites.current.has(id)) return false
    statusWrites.current.add(id)
    setUpdating(new Set(statusWrites.current))
    return true
  }

  function finishStatusUpdate(id) {
    statusWrites.current.delete(id)
    setUpdating(new Set(statusWrites.current))
  }

  async function signOut() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      if (error.status !== 401) notify(error.message, { error: true })
      setLoggingOut(false)
    }
  }

  return (
    <>
      <aside className="nav-surface inverse-focus fixed inset-y-0 left-0 z-10 hidden w-rail flex-col border-r border-navy-800 md:flex lg:w-sidebar">
        <div className="flex min-h-rail items-center justify-center border-b border-white/10 px-3 lg:min-h-24 lg:justify-start lg:px-5">
          <Brand compact subtitle inverse />
        </div>
        <div className="mt-3">
          <Navigation />
        </div>
        <div className="mt-auto grid min-w-0 grid-cols-1 justify-items-center gap-2 border-t border-white/10 p-2 lg:justify-items-stretch lg:px-4 lg:py-4">
          <div className="min-w-0 lg:rounded-card lg:border lg:border-white/10 lg:bg-white/5 lg:p-3"><UserIdentity user={session.user} /></div>
          <div className="rail-link min-w-0">
            <Tooltip label="Log out" side="right">
              <Button variant="nav" compact busy={loggingOut} aria-label="Log out" onClick={signOut} className="w-full lg:justify-start">
                <LogOut aria-hidden="true" size={20} className="shrink-0" />
                <span className="sr-only lg:not-sr-only">Log out</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </aside>

      <header className="safe-top-bar inverse-focus flex items-center justify-between gap-3 border-b border-white/10 bg-navy-950 px-4 md:hidden">
        <div className="shrink-0"><Brand inverse /></div>
        <div className="flex min-w-0 items-center gap-1">
          <UserIdentity user={session.user} mobile />
          <Button variant="nav" compact busy={loggingOut} aria-label="Log out" onClick={signOut}>
            <LogOut aria-hidden="true" size={20} />
          </Button>
        </div>
      </header>
      <Navigation mobile />

      <main id="main-content" tabIndex={-1} className="md:ml-rail lg:ml-sidebar">
        <div className="pb-above-nav max-w-content px-4 pt-6 md:px-6 lg:pb-8">
          <Outlet context={{ summary, recent, revision, refreshDashboard, updating, beginStatusUpdate, finishStatusUpdate }} />
        </div>
      </main>
    </>
  )
}
