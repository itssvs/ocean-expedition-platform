import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import { Button, ErrorNote, Field, inputCls } from '../components/ui'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'crew', specialization: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = { ...form }
      if (payload.role !== 'scientist') delete payload.specialization
      await register(payload)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Check that it is running.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Choose the role that matches your work on board.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorNote>{error}</ErrorNote>
        <Field label="Full name"><input className={inputCls} value={form.name} onChange={set('name')} required /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set('email')} required /></Field>
        <Field label="Password"><input className={inputCls} type="password" value={form.password} onChange={set('password')} required /></Field>
        <Field label="Role">
          <select className={inputCls} value={form.role} onChange={set('role')}>
            <option value="admin">Admin</option>
            <option value="scientist">Scientist</option>
            <option value="captain">Captain</option>
            <option value="crew">Crew</option>
          </select>
        </Field>
        {form.role === 'scientist' && (
          <Field label="Specialization">
            <input className={inputCls} value={form.specialization} onChange={set('specialization')} placeholder="Physical oceanography" />
          </Field>
        )}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</Button>
      </form>
      <p className="mt-6 text-sm text-mist">
        Already registered? <Link className="font-medium text-glow hover:underline" to="/login">Log in</Link>
      </p>
    </AuthShell>
  )
}
