import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ErrorNote, PageHeader, fmtDate, useList } from '../components/ui'

const COLORS = ['#3fe0cf', '#f4a63c', '#ff6b6b', '#58a6ff', '#c084fc', '#6fdc8c']
const has = (p) => p && p.lat != null && p.lng != null

export default function MapView() {
  const stations = useList('/stations')
  const vessels = useList('/vessels')
  const expeditions = useList('/expeditions')
  const [show, setShow] = useState({ stations: true, vessels: true, routes: true })
  const error = stations.error || vessels.error || expeditions.error

  // Route of an expedition: its saved waypoints, otherwise the vessel's position
  // (current position, or home port) followed by each station in order.
  const routeFor = (x) => {
    if (x.route && x.route.length > 1) {
      return [...x.route].sort((a, b) => a.order - b.order).map((p) => [p.lat, p.lng])
    }
    const pts = []
    const vessel = vessels.items.find((v) => v._id === x.vesselId?._id)
    const start = has(vessel?.currentPosition) ? vessel.currentPosition : vessel?.homePort
    if (has(start)) pts.push([start.lat, start.lng])
    ;(x.stationIds || []).forEach((s) => has(s.coordinates) && pts.push([s.coordinates.lat, s.coordinates.lng]))
    return pts
  }

  const active = expeditions.items.filter((x) => x.status !== 'cancelled')
  const toggle = (k) => setShow({ ...show, [k]: !show[k] })

  const layers = [
    ['stations', 'Stations', '#3fe0cf'],
    ['vessels', 'Vessels', '#f4a63c'],
    ['routes', 'Routes', '#58a6ff'],
  ]

  return (
    <div>
      <PageHeader title="Map" subtitle="Stations, vessels and the routes expeditions will take." />
      <ErrorNote>{error}</ErrorNote>

      <div className="relative overflow-hidden rounded-2xl border border-line">
        <MapContainer center={[14, 82]} zoom={6} style={{ height: '68vh', width: '100%' }}>
          <TileLayer
  className="dark-tiles"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

          {show.routes && active.map((x, i) => {
            const pts = routeFor(x)
            if (pts.length < 2) return null
            return (
              <Polyline key={x._id} positions={pts} pathOptions={{ color: COLORS[i % COLORS.length], weight: 3, dashArray: '8 8' }}>
                <Popup><b>{x.title}</b><br />{fmtDate(x.startDate)} to {fmtDate(x.endDate)}</Popup>
              </Polyline>
            )
          })}

          {show.stations && stations.items.filter((s) => has(s.coordinates)).map((s) => (
            <CircleMarker key={s._id} center={[s.coordinates.lat, s.coordinates.lng]} radius={7}
              pathOptions={{ color: '#08141d', weight: 2, fillColor: '#3fe0cf', fillOpacity: 1 }}>
              <Tooltip>{s.name}</Tooltip>
              <Popup>
                <b>{s.name}</b><br />
                Depth: {s.depth ?? '-'} m<br />
                Measures: {(s.parameters || []).join(', ') || '-'}
              </Popup>
            </CircleMarker>
          ))}

          {show.vessels && vessels.items.map((v) => {
            const pos = has(v.currentPosition) ? v.currentPosition : v.homePort
            if (!has(pos)) return null
            return (
              <CircleMarker key={v._id} center={[pos.lat, pos.lng]} radius={9}
                pathOptions={{ color: '#08141d', weight: 2, fillColor: '#f4a63c', fillOpacity: 1 }}>
                <Tooltip>{v.name}</Tooltip>
                <Popup>
                  <b>{v.name}</b> ({v.registrationNumber})<br />
                  Status: {v.status}<br />
                  {has(v.currentPosition) ? 'Current position' : 'Home port'}
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        <div className="absolute right-3 top-3 z-[1000] rounded-xl border border-line bg-deep/95 p-3 text-sm shadow-lg backdrop-blur">
          <p className="mb-2 font-medium text-foam">Layers</p>
          {layers.map(([k, label, color]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 py-1 text-mist hover:text-foam">
              <input type="checkbox" checked={show[k]} onChange={() => toggle(k)} className="accent-[#3fe0cf]" />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-line bg-trench px-4 py-3 text-sm">
          {active.map((x, i) => (
            <span key={x._id} className="flex items-center gap-2 text-mist">
              <span className="inline-block h-0.5 w-6" style={{ background: COLORS[i % COLORS.length] }} />
              {x.title}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
