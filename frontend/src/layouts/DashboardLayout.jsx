import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/classes', label: 'Classes', icon: GraduationCap },
  { to: '/presences', label: 'Présences', icon: ClipboardCheck },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:flex bg-ink-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-ink-200 bg-white">
        <SidebarContent onLogout={handleLogout} user={user} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 bg-white shadow-xl animate-slide-up">
            <SidebarContent onLogout={handleLogout} user={user} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-ink-200 bg-white/80 backdrop-blur px-4 lg:px-8">
          <button
            className="lg:hidden rounded-lg p-2 text-ink-700 hover:bg-ink-100"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-ink-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-500 leading-tight">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-white text-sm font-semibold">
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ user, onLogout, onNavigate }) {
  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-ink-200 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-white">
          <ClipboardCheck size={15} />
        </div>
        <span className="font-semibold text-ink-900 tracking-tight">EduPresence</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
              )
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <NavLink
          to="/profil"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-700 hover:bg-ink-100'
            )
          }
        >
          <UserIcon size={16} />
          Mon profil
        </NavLink>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-red-50 hover:text-red-700 transition"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </>
  )
}
