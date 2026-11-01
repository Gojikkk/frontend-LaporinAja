import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Files, LayoutDashboard, LogOut, MessageSquareText, Tags } from 'lucide-react'
import { useAuth } from '../../shared/auth-context'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/laporan', label: 'Manajemen Laporan', icon: Files, end: false },
  { to: '/admin/kategori', label: 'Kategori Laporan', icon: Tags, end: false },
]

/** Judul tab mengikuti halaman aktif, lalu dikembalikan saat admin ditinggalkan. */
export function useAdminTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · LaporinAja Admin`
    return () => {
      document.title = previous
    }
  }, [title])
}

export function AdminShell({ crumb, children }: { crumb: string; children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    setLogoutBusy(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Tidak dapat keluar dari akun.')
    } finally {
      setLogoutBusy(false)
    }
  }

  return (
    <div className="adm">
      <a className="adm-skip" href="#adm-main">
        Lewati ke konten utama
      </a>

      <header className="adm-topbar">
        <Link className="adm-brand" to="/admin">
          <span className="adm-brand-mark" aria-hidden="true">
            <MessageSquareText size={21} />
          </span>
          <span className="adm-brand-name">LaporinAja</span>
        </Link>
        <span className="adm-account">Administrator platform</span>
      </header>

      <div className="adm-workspace">
        <aside className="adm-sidebar" aria-label="Navigasi administrator">
          <p className="adm-nav-label">ADMINISTRATOR</p>
          <nav className="adm-nav">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="adm-nav-link">
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
            <button className="adm-nav-link" type="button" disabled={logoutBusy} onClick={() => void handleLogout()}>
              <LogOut size={20} aria-hidden="true" />
              <span>{logoutBusy ? 'Keluar…' : 'Logout'}</span>
            </button>
          </nav>
          <Link className="adm-public-link" to="/">
            Kembali ke situs publik ↗
          </Link>
        </aside>

        <main className="adm-content" id="adm-main" tabIndex={-1}>
          <nav className="adm-quicknav" aria-label="Navigasi administrator">
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className="adm-quicknav-link">
                {label}
              </NavLink>
            ))}
            <button className="adm-quicknav-link" type="button" disabled={logoutBusy} onClick={() => void handleLogout()}>
              {logoutBusy ? 'Keluar…' : 'Logout'}
            </button>
          </nav>

          {logoutError && <p className="adm-logout-error" role="alert">{logoutError}</p>}

          <div className="adm-context">
            <span>Admin / {crumb}</span>
            <span>Data demonstrasi</span>
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
