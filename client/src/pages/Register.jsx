import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'crew', specialization: '' })
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      if (payload.role !== 'scientist') delete payload.specialization
      await register(payload)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  const input = 'border w-full p-2 mb-3 rounded'

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-96">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <input className={input} name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
        <input className={input} name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input className={input} name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <select className={input} name="role" value={form.role} onChange={onChange}>
          <option value="admin">Admin</option>
          <option value="scientist">Scientist</option>
          <option value="captain">Captain</option>
          <option value="crew">Crew</option>
        </select>
        {form.role === 'scientist' && (
          <input className={input} name="specialization" placeholder="Specialization (e.g. Physical Oceanography)"
            value={form.specialization} onChange={onChange} />
        )}
        <button className="bg-sky-700 text-white w-full p-2 rounded">Register</button>
        <p className="mt-4 text-sm">
          Have an account? <Link className="text-sky-700" to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
