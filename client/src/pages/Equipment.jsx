import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const empty = { name: '', type: '', serialNumber: '', calibrationDate: '', status: 'available' }
const badge = {
  available: 'bg-emerald-100 text-emerald-800',
  'in-use': 'bg-sky-100 text-sky-800',
  maintenance: 'bg-amber-100 text-amber-800',
}

export default function Equipment() {
  const { user } = useAuth()
  const canCreate = user.role === 'admin'
  const canEdit = ['admin', 'scientist'].includes(user.role)
  const canDelete = user.role === 'admin'
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/equipment')
      setItems(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load equipment')
    }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const openAdd = () => { setForm(empty); setEditingId(null); setShowForm(true); setError('') }
  const openEdit = (it) => {
    setForm({
      name: it.name,
      type: it.type,
      serialNumber: it.serialNumber,
      calibrationDate: it.calibrationDate ? it.calibrationDate.slice(0, 10) : '',
      status: it.status,
    })
    setEditingId(it._id)
    setShowForm(true)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form }
    if (!payload.calibrationDate) delete payload.calibrationDate
    try {
      if (editingId) await api.put(`/equipment/${editingId}`, payload)
      else await api.post('/equipment', payload)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this equipment?')) return
    try {
      await api.delete(`/equipment/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const input = 'border w-full p-2 rounded'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Equipment</h1>
        {canCreate && (
          <button onClick={openAdd} className="bg-sky-700 text-white px-4 py-2 rounded">+ Add Equipment</button>
        )}
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-semibold">{editingId ? 'Edit Equipment' : 'New Equipment'}</h2>
          <input className={input} name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className={input} name="type" placeholder="Type (e.g. CTD)" value={form.type} onChange={onChange} required />
          <input className={input} name="serialNumber" placeholder="Serial number" value={form.serialNumber} onChange={onChange} required />
          <input className={input} name="calibrationDate" type="date" value={form.calibrationDate} onChange={onChange} />
          <select className={input} name="status" value={form.status} onChange={onChange}>
            <option value="available">Available</option>
            <option value="in-use">In use</option>
            <option value="maintenance">Maintenance</option>
          </select>
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
              <th className="p-3">Type</th>
              <th className="p-3">Serial No.</th>
              <th className="p-3">Calibrated</th>
              <th className="p-3">Status</th>
              {(canEdit || canDelete) && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-3 font-medium">{it.name}</td>
                <td className="p-3">{it.type}</td>
                <td className="p-3">{it.serialNumber}</td>
                <td className="p-3">{it.calibrationDate ? it.calibrationDate.slice(0, 10) : '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${badge[it.status]}`}>{it.status}</span>
                </td>
                {(canEdit || canDelete) && (
                  <td className="p-3 space-x-3">
                    {canEdit && <button onClick={() => openEdit(it)} className="text-sky-700">Edit</button>}
                    {canDelete && <button onClick={() => onDelete(it._id)} className="text-red-600">Delete</button>}
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={6}>No equipment yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
