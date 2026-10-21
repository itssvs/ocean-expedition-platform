import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const empty = {
  title: '', description: '', startDate: '', endDate: '', status: 'planned',
  vesselId: '', leadScientistId: '', crewIds: [], equipmentIds: [], stationIds: [],
}
const badge = {
  planned: 'bg-slate-100 text-slate-700',
  ongoing: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-sky-100 text-sky-800',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Expeditions() {
  const { user } = useAuth()
  const canWrite = ['admin', 'scientist'].includes(user.role)
  const canDelete = user.role === 'admin'
  const [expeditions, setExpeditions] = useState([])
  const [vessels, setVessels] = useState([])
  const [users, setUsers] = useState([])
  const [equipment, setEquipment] = useState([])
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [e, v, u, q, s] = await Promise.all([
        api.get('/expeditions'), api.get('/vessels'), api.get('/users'),
        api.get('/equipment'), api.get('/stations'),
      ])
      setExpeditions(e.data); setVessels(v.data); setUsers(u.data)
      setEquipment(q.data); setStations(s.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const toggle = (field, id) => {
    const list = form[field]
    setForm({ ...form, [field]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] })
  }

  const openAdd = () => { setForm(empty); setEditingId(null); setShowForm(true); setError('') }
  const openEdit = (x) => {
    setForm({
      title: x.title,
      description: x.description || '',
      startDate: x.startDate ? x.startDate.slice(0, 10) : '',
      endDate: x.endDate ? x.endDate.slice(0, 10) : '',
      status: x.status,
      vesselId: x.vesselId?._id || '',
      leadScientistId: x.leadScientistId?._id || '',
      crewIds: (x.crewIds || []).map((c) => c._id),
      equipmentIds: (x.equipmentIds || []).map((c) => c._id),
      stationIds: (x.stationIds || []).map((c) => c._id),
    })
    setEditingId(x._id)
    setShowForm(true)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.endDate < form.startDate) return setError('End date cannot be before start date')
    try {
      if (editingId) await api.put(`/expeditions/${editingId}`, form)
      else await api.post('/expeditions', form)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this expedition?')) return
    try {
      await api.delete(`/expeditions/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const input = 'border w-full p-2 rounded'
  const leads = users.filter((u) => ['scientist', 'admin'].includes(u.role))
  const crewUsers = users.filter((u) => ['captain', 'crew'].includes(u.role))

  const Checks = ({ field, items, label }) => (
    <div className="col-span-2">
      <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
      <div className="flex flex-wrap gap-3 border rounded p-2 max-h-28 overflow-auto">
        {items.length === 0 && <span className="text-slate-400 text-sm">None available</span>}
        {items.map((it) => (
          <label key={it._id} className="text-sm flex items-center gap-1">
            <input type="checkbox" checked={form[field].includes(it._id)} onChange={() => toggle(field, it._id)} />
            {it.name}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Expeditions</h1>
        {canWrite && (
          <button onClick={openAdd} className="bg-sky-700 text-white px-4 py-2 rounded">+ Plan Expedition</button>
        )}
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-semibold">{editingId ? 'Edit Expedition' : 'New Expedition'}</h2>
          <input className={`${input} col-span-2`} name="title" placeholder="Title" value={form.title} onChange={onChange} required />
          <textarea className={`${input} col-span-2`} name="description" placeholder="Description" value={form.description} onChange={onChange} />
          <label className="text-sm">Start date
            <input className={input} name="startDate" type="date" value={form.startDate} onChange={onChange} required />
          </label>
          <label className="text-sm">End date
            <input className={input} name="endDate" type="date" value={form.endDate} onChange={onChange} required />
          </label>
          <label className="text-sm">Vessel
            <select className={input} name="vesselId" value={form.vesselId} onChange={onChange} required>
              <option value="">Select vessel</option>
              {vessels.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.registrationNumber})</option>)}
            </select>
          </label>
          <label className="text-sm">Lead scientist
            <select className={input} name="leadScientistId" value={form.leadScientistId} onChange={onChange} required>
              <option value="">Select lead</option>
              {leads.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
          </label>
          <label className="text-sm">Status
            <select className={input} name="status" value={form.status} onChange={onChange}>
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div />
          <Checks field="crewIds" items={crewUsers} label="Crew" />
          <Checks field="equipmentIds" items={equipment} label="Equipment" />
          <Checks field="stationIds" items={stations} label="Sampling stations" />
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
              <th className="p-3">Title</th>
              <th className="p-3">Vessel</th>
              <th className="p-3">Lead</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Status</th>
              <th className="p-3">Crew / Equip / Stations</th>
              {(canWrite || canDelete) && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expeditions.map((x) => (
              <tr key={x._id} className="border-t">
                <td className="p-3 font-medium">{x.title}</td>
                <td className="p-3">{x.vesselId?.name || '-'}</td>
                <td className="p-3">{x.leadScientistId?.name || '-'}</td>
                <td className="p-3 text-sm">{x.startDate?.slice(0, 10)} to {x.endDate?.slice(0, 10)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${badge[x.status]}`}>{x.status}</span>
                </td>
                <td className="p-3">{x.crewIds?.length || 0} / {x.equipmentIds?.length || 0} / {x.stationIds?.length || 0}</td>
                {(canWrite || canDelete) && (
                  <td className="p-3 space-x-3">
                    {canWrite && <button onClick={() => openEdit(x)} className="text-sky-700">Edit</button>}
                    {canDelete && <button onClick={() => onDelete(x._id)} className="text-red-600">Delete</button>}
                  </td>
                )}
              </tr>
            ))}
            {expeditions.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={7}>No expeditions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
