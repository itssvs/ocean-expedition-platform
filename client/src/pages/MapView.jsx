import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'

const COLORS = ['#e11d48', '#7c3aed', '#ea580c', '#0d9488', '#ca8a04', '#2563eb']
const has = (p) => p && p.lat != null && p.lng != null

export default function MapView() {
  const [stations, setStations] = useState([])
  const [vessels, setVessels] = useState([])
  const [expeditions, setExpeditions] = useState([])
  const [show, setShow] = useState({ stations: true, vessels: true, routes: true })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/stations'), api.get('/vessels'), api.get('/expeditions')])
      .then(([s, v, e]) => { setStations(s.data); setVessels(v.data); setExpeditions(e.data) })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load map data'))
  }, [])

  // Route of an expedition: its saved waypoints, otherwise the vessel's home port
  // followed by each of its stations in order.
  const routeFor = (x) => {
    if (x.route && x.route.length > 1) {
      return [...x.route].sort((a, b) => a.order - b.order).map((p) => [p.lat, p.lng])
    }
    const pts = []
    if (has(x.vesselId?.homePort)) pts.push([x.vesselId.homePort.lat, x.vesselId.homePort.lng])
    ;(x.stationIds || []).forEach((s) => has(s.coordinates) && pts.push([s.coordinates.lat, s.coordinates.lng]))
    return pts
  }

  const toggle = (k) => setShow({ ...show, [k]: !show[k] })
  const active = expeditions.filter((x) => x.status !== 'cancelled')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Map</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex flex-wrap gap-6 mb-3 text-sm">
        {[['stations', 'Sampling stations'], ['vessels', 'Vessels'], ['routes', 'Expedition routes']].map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={show[k]} onChange={() => toggle(k)} /> {label}
          </label>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden shadow bg-white">
        <MapContainer center={[14, 82]} zoom={6} style={{ height: '65vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {show.stations && stations.filter((s) => has(s.coordinates)).map((s) => (
            <CircleMarker key={s._id} center={[s.coordinates.lat, s.coordinates.lng]} radius={8}
              pathOptions={{ color: '#075985', fillColor: '#0ea5e9', fillOpacity: 0.85 }}>
              <Tooltip>{s.name}</Tooltip>
              <Popup>
                <b>{s.name}</b><br />
                Depth: {s.depth ?? '-'} m<br />
                Parameters: {(s.parameters || []).join(', ') || '-'}
              </Popup>
            </CircleMarker>
          ))}

          {show.vessels && vessels.map((v) => {
            const pos = has(v.currentPosition) ? v.currentPosition : v.homePort
            if (!has(pos)) return null
            return (
              <CircleMarker key={v._id} center={[pos.lat, pos.lng]} radius={10}
                pathOptions={{ color: '#7f1d1d', fillColor: '#f59e0b', fillOpacity: 0.95 }}>
                <Tooltip>{v.name}</Tooltip>
                <Popup>
                  <b>{v.name}</b> ({v.registrationNumber})<br />
                  Status: {v.status}<br />
                  {has(v.currentPosition) ? 'Current position' : 'Home port'}
                </Popup>
              </CircleMarker>
            )
          })}

          {show.routes && active.map((x, i) => {
            const pts = routeFor(x)
            if (pts.length < 2) return null
            return (
              <Polyline key={x._id} positions={pts} pathOptions={{ color: COLORS[i % COLORS.length], weight: 4, dashArray: '8 8' }}>
                <Popup><b>{x.title}</b><br />{x.status}</Popup>
              </Polyline>
            )
          })}
        </MapContainer>
      </div>

      <div className="mt-4 bg-white rounded-xl shadow p-4 text-sm">
        <p className="font-semibold mb-2">Legend</p>
        <div className="flex flex-wrap gap-5">
          <span><span className="inline-block w-3 h-3 rounded-full bg-sky-500 mr-1" />Station</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1" />Vessel</span>
          {active.map((x, i) => (
            <span key={x._id}>
              <span className="inline-block w-5 h-1 mr-1 align-middle" style={{ background: COLORS[i % COLORS.length] }} />
              {x.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
