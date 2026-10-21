import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name}</h1>
      <p className="text-slate-500 mt-2">You are signed in as {user.role}.</p>
    </div>
  )
}
