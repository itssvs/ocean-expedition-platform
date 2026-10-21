import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/vessels', label: 'Vessels', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/equipment', label: 'Equipment', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/stations', label: 'Stations', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/expeditions', label: 'Expeditions', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/map', label: 'Map', roles: ['admin', 'scientist', 'captain', 'crew'] },
  { to: '/analytics', label: 'Analytics', roles: ['admin', 'scientist'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">OceanOps</h2>
        <nav className="flex-1 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${isActive ? 'bg-sky-700' : 'hover:bg-slate-800'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="font-medium">{user.name}</p>
          <span className="inline-block text-xs bg-sky-600 px-2 py-0.5 rounded mt-1">{user.role}</span>
          <button onClick={handleLogout} className="block mt-3 text-sm text-slate-300 hover:text-white">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
