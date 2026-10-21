import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const empty = { name: '', lat: '', lng: '', depth: '', parameters: '', description: '' }

export default function Stations() {
  const { user } = useAuth()
  const canWrite = ['admin', 'scientist'].includes(user.role)
  const canDelete = user.role === 'admin'
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/stations')
      setStations(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stations')
    }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const openAdd = () => { setForm(empty); setEditingId(null); setShowForm(true); setError('') }
  const openEdit = (s) => {
    setForm({
      name: s.name,
      lat: s.coordinates?.lat ?? '',
      lng: s.coordinates?.lng ?? '',
      depth: s.depth ?? '',
      parameters: (s.parameters || []).join(', '),
      description: s.description || '',
    })
    setEditingId(s._id)
    setShowForm(true)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      name: form.name,
      coordinates: { lat: Number(form.lat), lng: Number(form.lng) },
      parameters: form.parameters.split(',').map((p) => p.trim()).filter(Boolean),
      description: form.description,
    }
    if (form.depth !== '') payload.depth = Number(form.depth)
    try {
      if (editingId) await api.put(`/stations/${editingId}`, payload)
      else await api.post('/stations', payload)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this station?')) return
    try {
      await api.delete(`/stations/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const input = 'border w-full p-2 rounded'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Sampling Stations</h1>
        {canWrite && (
          <button onClick={openAdd} className="bg-sky-700 text-white px-4 py-2 rounded">+ Add Station</button>
        )}
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-semibold">{editingId ? 'Edit Station' : 'New Station'}</h2>
          <input className={`${input} col-span-2`} name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className={input} name="lat" type="number" step="any" placeholder="Latitude" value={form.lat} onChange={onChange} required />
          <input className={input} name="lng" type="number" step="any" placeholder="Longitude" value={form.lng} onChange={onChange} required />
          <input className={input} name="depth" type="number" placeholder="Depth (m)" value={form.depth} onChange={onChange} />
          <input className={input} name="parameters" placeholder="Parameters, comma separated" value={form.parameters} onChange={onChange} />
          <textarea className={`${input} col-span-2`} name="description" placeholder="Description" value={form.description} onChange={onChange} />
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
              <th className="p-3">Coordinates</th>
              <th className="p-3">Depth (m)</th>
              <th className="p-3">Parameters</th>
              {(canWrite || canDelete) && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {stations.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.coordinates?.lat}, {s.coordinates?.lng}</td>
                <td className="p-3">{s.depth ?? '-'}</td>
                <td className="p-3">
                  {(s.parameters || []).map((p) => (
                    <span key={p} className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded mr-1">{p}</span>
                  ))}
                </td>
                {(canWrite || canDelete) && (
                  <td className="p-3 space-x-3">
                    {canWrite && <button onClick={() => openEdit(s)} className="text-sky-700">Edit</button>}
                    {canDelete && <button onClick={() => onDelete(s._id)} className="text-red-600">Delete</button>}
                  </td>
                )}
              </tr>
            ))}
            {stations.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={5}>No stations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
