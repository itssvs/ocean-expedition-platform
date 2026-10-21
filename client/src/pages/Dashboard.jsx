import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge, ErrorNote, Icon, PageHeader, Panel, fmtDate, useList } from '../components/ui'

const DAY = 24 * 60 * 60 * 1000

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Stat({ label, value, note, meter }) {
  return (
    <div className="rounded-2xl border border-line bg-trench p-5">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-foam">{value}</p>
      {meter != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ridge">
          <div className="h-full rounded-full bg-glow" style={{ width: `${meter}%` }} />
        </div>
      )}
      <p className="mt-2 text-xs text-mist">{note}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const vessels = useList('/vessels')
  const equipment = useList('/equipment')
  const stations = useList('/stations')
  const expeditions = useList('/expeditions')
  const error = vessels.error || equipment.error || stations.error || expeditions.error

  const atSea = vessels.items.filter((v) => v.status === 'at-sea').length
  const available = equipment.items.filter((e) => e.status === 'available').length
  const ongoing = expeditions.items.filter((x) => x.status === 'ongoing').length
  const planned = expeditions.items.filter((x) => x.status === 'planned').length
  const now = Date.now()

  const timeline = [...expeditions.items]
    .filter((x) => x.status === 'ongoing' || x.status === 'planned')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5)

  const attention = equipment.items.filter(
    (e) => e.status === 'maintenance' || (e.calibrationDate && now - new Date(e.calibrationDate) > 365 * DAY)
  )

  const progress = (x) => {
    const s = new Date(x.startDate).getTime()
    const e = new Date(x.endDate).getTime()
    return Math.max(0, Math.min(100, Math.round(((now - s) / (e - s)) * 100)))
  }

  const canPlan = ['admin', 'scientist'].includes(user.role)

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        action={canPlan && (
          <Link to="/expeditions" className="inline-flex items-center gap-2 rounded-lg bg-glow px-4 py-2 text-sm font-semibold text-abyss hover:bg-glow/90">
            <Icon name="plus" className="h-4 w-4" /> Plan an expedition
          </Link>
        )}
      />
      <ErrorNote>{error}</ErrorNote>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Expeditions" value={expeditions.items.length} note={`${ongoing} ongoing, ${planned} planned`} />
        <Stat label="Vessels" value={vessels.items.length} note={`${atSea} at sea right now`} />
        <Stat
          label="Equipment ready" value={`${available}/${equipment.items.length}`}
          meter={equipment.items.length ? Math.round((available / equipment.items.length) * 100) : 0}
          note="available for assignment"
        />
        <Stat label="Sampling stations" value={stations.items.length} note="recorded locations" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Upcoming and ongoing" action={<Link to="/expeditions" className="text-sm text-glow hover:underline">View all</Link>}>
          {timeline.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mist">No expeditions scheduled. Plan one to see it here.</p>
          ) : (
            <ul>
              {timeline.map((x) => (
                <li key={x._id} className="border-b border-line/60 px-5 py-4 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foam">{x.title}</p>
                      <p className="mt-0.5 text-sm text-mist">
                        {x.vesselId?.name || 'No vessel'} · {fmtDate(x.startDate)} to {fmtDate(x.endDate)}
                      </p>
                    </div>
                    <Badge status={x.status} />
                  </div>
                  {x.status === 'ongoing' && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ridge">
                        <div className="h-full rounded-full bg-glow" style={{ width: `${progress(x)}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-mist">{progress(x)}%</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Fleet">
            {vessels.items.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist">No vessels recorded yet.</p>
            ) : (
              <ul>
                {vessels.items.slice(0, 5).map((v) => (
                  <li key={v._id} className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foam">{v.name}</p>
                      <p className="text-xs text-mist">{v.registrationNumber}</p>
                    </div>
                    <Badge status={v.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Needs attention">
            {attention.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist">All equipment is in service and recently calibrated.</p>
            ) : (
              <ul>
                {attention.slice(0, 5).map((e) => (
                  <li key={e._id} className="border-b border-line/60 px-5 py-3 last:border-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-foam">{e.name}</p>
                      <Badge status={e.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-mist">Last calibrated {fmtDate(e.calibrationDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
