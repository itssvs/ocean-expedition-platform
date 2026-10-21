import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { ErrorNote, PageHeader, Panel, STATUS, useList } from '../components/ui'

const AXIS = '#8ba5b3'
const GRID = '#24465c'
const tooltipStyle = {
  contentStyle: { background: '#12293a', border: '1px solid #24465c', borderRadius: 8, color: '#e8f3f6' },
  itemStyle: { color: '#e8f3f6' },
  cursor: { fill: 'rgba(63,224,207,0.08)' },
}

const countBy = (items, key) => {
  const counts = {}
  items.forEach((i) => { counts[i[key]] = (counts[i[key]] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}
const colorOf = (name) => STATUS[name]?.hex || '#8ba5b3'

function ChartBox({ title, empty, children }) {
  return (
    <Panel title={title}>
      <div className="h-72 p-4">
        {empty ? <p className="pt-24 text-center text-sm text-mist">No data yet</p> : children}
      </div>
    </Panel>
  )
}

function StatusBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke={AXIS} tickLine={false} />
        <YAxis allowDecimals={false} stroke={AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
          {data.map((d) => <Cell key={d.name} fill={colorOf(d.name)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function Analytics() {
  const vessels = useList('/vessels')
  const equipment = useList('/equipment')
  const stations = useList('/stations')
  const expeditions = useList('/expeditions')
  const error = vessels.error || equipment.error || stations.error || expeditions.error

  const vesselData = countBy(vessels.items, 'status')
  const equipmentData = countBy(equipment.items, 'status')
  const expeditionData = countBy(expeditions.items, 'status')
  const depthData = stations.items.filter((s) => s.depth != null).map((s) => ({ name: s.name, depth: s.depth }))
  const inUse = equipment.items.filter((e) => e.status === 'in-use').length
  const utilisation = equipment.items.length ? Math.round((inUse / equipment.items.length) * 100) : 0

  const stats = [
    ['Vessels', vessels.items.length],
    ['Equipment', equipment.items.length],
    ['Stations', stations.items.length],
    ['Expeditions', expeditions.items.length],
    ['Equipment in use', `${utilisation}%`],
  ]

  return (
    <div>
      <PageHeader title="Analytics" subtitle="How the fleet, instruments and expeditions are doing." />
      <ErrorNote>{error}</ErrorNote>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-trench p-4">
            <p className="text-sm text-mist">{label}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foam">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartBox title="Vessels by status" empty={vesselData.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={vesselData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
                {vesselData.map((d) => <Cell key={d.name} fill={colorOf(d.name)} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: '#e8f3f6' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Equipment by status" empty={equipmentData.length === 0}>
          <StatusBars data={equipmentData} />
        </ChartBox>

        <ChartBox title="Expeditions by status" empty={expeditionData.length === 0}>
          <StatusBars data={expeditionData} />
        </ChartBox>

        <ChartBox title="Station depth (m)" empty={depthData.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depthData}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={AXIS} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="depth" name="Depth (m)" fill="#3fe0cf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </div>
  )
}
