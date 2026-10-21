import ResourceManager from '../components/ResourceManager'
import { Badge, fmtDate } from '../components/ui'

const emptyForm = { name: '', type: '', serialNumber: '', calibrationDate: '', status: 'available' }
const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in-use', label: 'In use' },
  { value: 'maintenance', label: 'Maintenance' },
]

export default function Equipment() {
  return (
    <ResourceManager
      title="Equipment" noun="Equipment" path="/equipment"
      emptyHint="Add instruments such as CTD sensors so they can be assigned to expeditions."
      can={{ create: ['admin'], edit: ['admin', 'scientist'], delete: ['admin'] }}
      emptyForm={emptyForm}
      searchText={(e) => `${e.name} ${e.type} ${e.serialNumber}`}
      filter={{ get: (e) => e.status, options: statusOptions }}
      columns={[
        { label: 'Name', render: (e) => <span className="font-medium text-foam">{e.name}</span> },
        { label: 'Type', render: (e) => e.type },
        { label: 'Serial number', render: (e) => e.serialNumber },
        { label: 'Last calibrated', className: 'text-mist', render: (e) => fmtDate(e.calibrationDate) },
        { label: 'Status', render: (e) => <Badge status={e.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, placeholder: 'CTD Sensor Unit 3' },
        { name: 'type', label: 'Type', required: true, placeholder: 'CTD' },
        { name: 'serialNumber', label: 'Serial number', required: true, placeholder: 'CTD-2024-003' },
        { name: 'calibrationDate', label: 'Last calibration date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: statusOptions, span2: true },
      ]}
      toForm={(e) => ({
        name: e.name, type: e.type, serialNumber: e.serialNumber, status: e.status,
        calibrationDate: e.calibrationDate ? e.calibrationDate.slice(0, 10) : '',
      })}
      toPayload={(f) => {
        const p = { ...f }
        if (!p.calibrationDate) delete p.calibrationDate
        return p
      }}
    />
  )
}
