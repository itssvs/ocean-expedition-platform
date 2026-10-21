import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon, Badge } from './ui'

const ALL = ['admin', 'scientist', 'captain', 'crew']
const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', roles: ALL },
  { to: '/expeditions', label: 'Expeditions', icon: 'expedition', roles: ALL },
  { to: '/vessels', label: 'Vessels', icon: 'vessel', roles: ALL },
  { to: '/equipment', label: 'Equipment', icon: 'equipment', roles: ALL },
  { to: '/stations', label: 'Stations', icon: 'station', roles: ALL },
  { to: '/map', label: 'Map', icon: 'map', roles: ALL },
  { to: '/analytics', label: 'Analytics', icon: 'analytics', roles: ['admin', 'scientist'] },
]

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#12293a" stroke="#3fe0cf" strokeWidth="1.5" />
        <path d="M5 18c3-4 5-4 8 0s5 4 8 0 4-3 6-1" fill="none" stroke="#3fe0cf" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 23c3-3 5-3 8 0s5 3 8 0" fill="none" stroke="#3fe0cf" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16" cy="9" r="2.2" fill="#f4a63c" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight text-foam">OceanOps</span>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-deep px-4 py-5">
      <div className="mb-8 px-2"><Wordmark /></div>
      <nav className="flex-1 space-y-1" aria-label="Main">
        {navItems.filter((i) => i.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-trench font-medium text-glow' : 'text-mist hover:bg-trench/60 hover:text-foam'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-glow" />}
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-xl border border-line bg-trench p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ridge text-sm font-semibold text-glow">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foam">{user.name}</p>
            <p className="truncate text-xs capitalize text-mist">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line py-1.5 text-sm text-mist transition-colors hover:bg-ridge hover:text-foam"
        >
          <Icon name="logout" className="h-4 w-4" /> Log out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">{sidebar}</div>

      <div className="sticky top-0 z-[1500] flex items-center justify-between border-b border-line bg-deep px-4 py-3 lg:hidden">
        <Wordmark />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-md p-1.5 text-foam hover:bg-ridge">
          <Icon name="menu" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[1600] lg:hidden">
          <div className="absolute inset-0 bg-abyss/70" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  )
}
