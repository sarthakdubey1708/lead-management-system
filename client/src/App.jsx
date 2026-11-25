import { useLayoutEffect, useRef } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { LoginPage } from './auth/LoginPage.jsx'
import { useAuth } from './auth/auth-context.js'
import { AppShell } from './components/AppShell.jsx'
import { LoadError, LoadingLabel } from './components/Feedback.jsx'
import { PageHeading, SkipLink } from './components/PageHeading.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { DashboardPage } from './dashboard/DashboardPage.jsx'
import { LeadsPage } from './leads/LeadsPage.jsx'

function NotFound() {
  return (
    <>
      <PageHeading title="Page not found" description="This address doesn’t match a BizLeap page." />
      <Link to="/" className="inline-flex min-h-touch items-center rounded-control font-semibold text-brand-600 hover:underline md:min-h-control">Back to dashboard</Link>
    </>
  )
}

function AppRoutes() {
  const { session, retry } = useAuth()
  const location = useLocation()
  const renderedPath = useRef(null)

  useLayoutEffect(() => {
    if (!session || session.error) return
    const heading = document.querySelector('#main-content h1')
    if (!heading) return // A redirect has not rendered its destination yet.

    const previousPath = renderedPath.current
    renderedPath.current = location.pathname
    if (previousPath !== null && previousPath !== location.pathname) {
      window.scrollTo(0, 0)
      heading.focus({ preventScroll: true })
    }
  }, [location.pathname, session])

  if (!session || session.error) {
    return (
      <main id="main-content" tabIndex={-1} className="grid min-h-dvh place-items-center p-4">
        <div className="w-full max-w-sm rounded-card border border-line bg-surface p-5 md:p-8">
          <h1 className="mb-3 text-h1 text-ink-800">BizLeap</h1>
          {session?.error
            ? <LoadError title="Could not check your session" error={session.error} retry={retry} />
            : <LoadingLabel>Checking your session…</LoadingLabel>}
        </div>
      </main>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={session.user ? <Navigate to={location.state?.from === '/leads' ? '/leads' : '/'} replace /> : <LoginPage />} />
      <Route element={session.user ? <AppShell /> : <Navigate to="/login" state={{ from: location.pathname }} replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SkipLink />
      <ToastProvider><AppRoutes /></ToastProvider>
    </AuthProvider>
  )
}
