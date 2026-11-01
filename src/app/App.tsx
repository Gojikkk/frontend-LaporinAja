import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell, Button, Toast } from '../components/ui'
import { AuthPage } from '../features/auth'
import { Admin, AdminDetail, AdminQueue, AdminCategories } from '../features/admin'
import { Home, Reports, Detail, Statistics, About, Privacy } from '../features/public'
import { Dashboard, CreateReport, PrivateDetail } from '../features/reporter'
import { Forbidden, NotFound } from '../features/system'
import { AuthProvider, useAuth } from '../shared/auth-context'

function ProtectedRoutes({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, status, error, refreshUser } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <AppShell><main className="empty-state page container"><p>Memeriksa sesi akun…</p></main></AppShell>
  }

  if (status === 'error') {
    return (
      <AppShell>
        <main className="empty-state page container">
          <h1>Sesi belum dapat diperiksa</h1>
          <p role="alert">{error}</p>
          <Button onClick={() => void refreshUser().catch(() => undefined)}>Coba lagi</Button>
        </main>
      </AppShell>
    )
  }

  if (!user) return <Navigate to="/masuk" replace state={{ from: location }} />
  if (adminOnly && !user.isAdmin) return <Navigate to="/403" replace />
  if (!adminOnly && user.isAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}

function Routed({ onToast }: { onToast: (s: string) => void }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-fade">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/laporan/:code" element={<Detail />} />
        <Route path="/statistik" element={<Statistics />} />
        <Route path="/tentang" element={<About />} />
        <Route path="/kebijakan-privasi" element={<Privacy />} />
        <Route path="/masuk" element={<AuthPage onToast={onToast} />} />
        <Route path="/daftar" element={<AuthPage register onToast={onToast} />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lapor/baru" element={<CreateReport onToast={onToast} />} />
          <Route path="/dashboard/laporan/:code" element={<PrivateDetail />} />
        </Route>
        <Route element={<ProtectedRoutes adminOnly />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/laporan" element={<AdminQueue />} />
          <Route path="/admin/laporan/:code" element={<AdminDetail />} />
          <Route path="/admin/kategori" element={<AdminCategories />} />
          <Route path="/admin/statistik" element={<Statistics admin />} />
        </Route>
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const [toast, setToast] = useState('')
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return <>
    <AuthProvider>
      <Routed onToast={setToast} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </AuthProvider>
  </>
}
