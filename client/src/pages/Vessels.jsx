import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const empty = { name: '', registrationNumber: '', capacity: '', status: 'docked', homeLat: '', homeLng: '' }
const badge = {
  docked: 'bg-sky-100 text-sky-800',
  'at-sea': 'bg-emerald-100 text-emerald-800',
  maintenance: 'bg-amber-100 text-amber-800',
}

export default function Vessels() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const [vessels, setVessels] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/vessels')
      setVessels(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vessels')
    }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const openAdd = () => { setForm(empty); setEditingId(null); setShowForm(true); setError('') }
  const openEdit = (v) => {
    setForm({
      name: v.name,
      registrationNumber: v.registrationNumber,
      capacity: v.capacity,
      status: v.status,
      homeLat: v.homePort?.lat ?? '',
      homeLng: v.homePort?.lng ?? '',
    })
    setEditingId(v._id)
    setShowForm(true)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      name: form.name,
      registrationNumber: form.registrationNumber,
      capacity: Number(form.capacity),
      status: form.status,
    }
    if (form.homeLat !== '' && form.homeLng !== '') {
      payload.homePort = { lat: Number(form.homeLat), lng: Number(form.homeLng) }
    }
    try {
      if (editingId) await api.put(`/vessels/${editingId}`, payload)
      else await api.post('/vessels', payload)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this vessel?')) return
    try {
      await api.delete(`/vessels/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const input = 'border w-full p-2 rounded'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Vessels</h1>
        {isAdmin && (
          <button onClick={openAdd} className="bg-sky-700 text-white px-4 py-2 rounded">
            + Add Vessel
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-semibold">{editingId ? 'Edit Vessel' : 'New Vessel'}</h2>
          <input className={input} name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className={input} name="registrationNumber" placeholder="Registration number" value={form.registrationNumber} onChange={onChange} required />
          <input className={input} name="capacity" type="number" placeholder="Capacity" value={form.capacity} onChange={onChange} required />
          <select className={input} name="status" value={form.status} onChange={onChange}>
            <option value="docked">Docked</option>
            <option value="at-sea">At sea</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <input className={input} name="homeLat" type="number" step="any" placeholder="Home port latitude" value={form.homeLat} onChange={onChange} />
          <input className={input} name="homeLng" type="number" step="any" placeholder="Home port longitude" value={form.homeLng} onChange={onChange} />
          <div className="col-span-2 flex gap-2">
            <button className="bg-sky-700 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Reg. No.</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Home port</th>
              {isAdmin && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vessels.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-3 font-medium">{v.name}</td>
                <td className="p-3">{v.registrationNumber}</td>
                <td className="p-3">{v.capacity}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${badge[v.status]}`}>{v.status}</span>
                </td>
                <td className="p-3">{v.homePort?.lat != null ? `${v.homePort.lat}, ${v.homePort.lng}` : '-'}</td>
                {isAdmin && (
                  <td className="p-3 space-x-3">
                    <button onClick={() => openEdit(v)} className="text-sky-700">Edit</button>
                    <button onClick={() => onDelete(v._id)} className="text-red-600">Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {vessels.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={6}>No vessels yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
