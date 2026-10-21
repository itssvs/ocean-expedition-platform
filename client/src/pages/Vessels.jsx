import ResourceManager from '../components/ResourceManager'
import { Badge } from '../components/ui'

const emptyForm = { name: '', registrationNumber: '', capacity: '', status: 'docked', homeLat: '', homeLng: '' }
const statusOptions = [
  { value: 'docked', label: 'Docked' },
  { value: 'at-sea', label: 'At sea' },
  { value: 'maintenance', label: 'Maintenance' },
]

export default function Vessels() {
  return (
    <ResourceManager
      title="Vessels" noun="Vessel" path="/vessels"
      emptyHint="Add the first research vessel to start planning expeditions."
      can={{ create: ['admin'], edit: ['admin'], delete: ['admin'] }}
      emptyForm={emptyForm}
      searchText={(v) => `${v.name} ${v.registrationNumber}`}
      filter={{ get: (v) => v.status, options: statusOptions }}
      columns={[
        { label: 'Name', render: (v) => <span className="font-medium text-foam">{v.name}</span> },
        { label: 'Registration', render: (v) => v.registrationNumber },
        { label: 'Capacity', render: (v) => `${v.capacity} people` },
        { label: 'Status', render: (v) => <Badge status={v.status} /> },
        { label: 'Home port', className: 'text-mist', render: (v) => (v.homePort?.lat != null ? `${v.homePort.lat}, ${v.homePort.lng}` : '-') },
      ]}
      fields={[
        { name: 'name', label: 'Vessel name', required: true, placeholder: 'RV Explorer' },
        { name: 'registrationNumber', label: 'Registration number', required: true, placeholder: 'OCN-001' },
        { name: 'capacity', label: 'Capacity (people)', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: statusOptions },
        { name: 'homeLat', label: 'Home port latitude', type: 'number', step: 'any', placeholder: '13.0827' },
        { name: 'homeLng', label: 'Home port longitude', type: 'number', step: 'any', placeholder: '80.2707' },
      ]}
      toForm={(v) => ({
        name: v.name, registrationNumber: v.registrationNumber, capacity: v.capacity, status: v.status,
        homeLat: v.homePort?.lat ?? '', homeLng: v.homePort?.lng ?? '',
      })}
      toPayload={(f) => {
        const p = { name: f.name, registrationNumber: f.registrationNumber, capacity: Number(f.capacity), status: f.status }
        if (f.homeLat !== '' && f.homeLng !== '') p.homePort = { lat: Number(f.homeLat), lng: Number(f.homeLng) }
        return p
      }}
    />
  )
}
