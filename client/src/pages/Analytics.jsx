import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import api from '../services/api'

const STATUS_COLORS = {
  docked: '#0ea5e9', 'at-sea': '#10b981', maintenance: '#f59e0b',
  available: '#10b981', 'in-use': '#0ea5e9',
  planned: '#94a3b8', ongoing: '#10b981', completed: '#0ea5e9', cancelled: '#ef4444',
}

const countBy = (items, key) => {
  const counts = {}
  items.forEach((i) => { counts[i[key]] = (counts[i[key]] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold text-slate-700 mb-2">{title}</h2>
      <div style={{ height: 260 }}>{children}</div>
    </div>
  )
}

function StatusBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" name="Count">
          {data.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#64748b'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function Analytics() {
  const [vessels, setVessels] = useState([])
  const [equipment, setEquipment] = useState([])
  const [stations, setStations] = useState([])
  const [expeditions, setExpeditions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/vessels'), api.get('/equipment'), api.get('/stations'), api.get('/expeditions')])
      .then(([v, q, s, e]) => {
        setVessels(v.data); setEquipment(q.data); setStations(s.data); setExpeditions(e.data)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
  }, [])

  const vesselData = countBy(vessels, 'status')
  const equipmentData = countBy(equipment, 'status')
  const expeditionData = countBy(expeditions, 'status')
  const depthData = stations.filter((s) => s.depth != null).map((s) => ({ name: s.name, depth: s.depth }))
  const inUse = equipment.filter((e) => e.status === 'in-use').length
  const utilisation = equipment.length ? Math.round((inUse / equipment.length) * 100) : 0

  const stats = [
    ['Vessels', vessels.length],
    ['Equipment', equipment.length],
    ['Stations', stations.length],
    ['Expeditions', expeditions.length],
    ['Equipment in use', `${utilisation}%`],
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Analytics</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Vessels by status">
          {vesselData.length === 0 ? <p className="text-slate-400">No data</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vesselData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {vesselData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#64748b'} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Equipment by status">
          {equipmentData.length === 0 ? <p className="text-slate-400">No data</p> : <StatusBar data={equipmentData} />}
        </Card>

        <Card title="Expeditions by status">
          {expeditionData.length === 0 ? <p className="text-slate-400">No data</p> : <StatusBar data={expeditionData} />}
        </Card>

        <Card title="Station depth (m)">
          {depthData.length === 0 ? <p className="text-slate-400">No data</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="depth" name="Depth (m)" fill="#0369a1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
