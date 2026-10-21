import ResourceManager from '../components/ResourceManager'

const emptyForm = { name: '', lat: '', lng: '', depth: '', parameters: '', description: '' }

export default function Stations() {
  return (
    <ResourceManager
      title="Stations" noun="Station" path="/stations"
      emptyHint="Add the locations where samples will be taken."
      can={{ create: ['admin', 'scientist'], edit: ['admin', 'scientist'], delete: ['admin'] }}
      emptyForm={emptyForm}
      searchText={(s) => `${s.name} ${(s.parameters || []).join(' ')}`}
      filter={{
        get: (s) => (s.depth == null ? 'unknown' : s.depth >= 1000 ? 'deep' : 'shallow'),
        options: [
          { value: 'shallow', label: 'Under 1000 m' },
          { value: 'deep', label: '1000 m and deeper' },
        ],
      }}
      columns={[
        { label: 'Name', render: (s) => <span className="font-medium text-foam">{s.name}</span> },
        { label: 'Coordinates', render: (s) => `${s.coordinates?.lat}, ${s.coordinates?.lng}` },
        { label: 'Depth', render: (s) => (s.depth != null ? `${s.depth} m` : '-') },
        {
          label: 'Parameters',
          render: (s) => (
            <div className="flex flex-wrap gap-1">
              {(s.parameters || []).map((p) => (
                <span key={p} className="rounded-md bg-ridge px-2 py-0.5 text-xs text-foam">{p}</span>
              ))}
            </div>
          ),
        },
      ]}
      fields={[
        { name: 'name', label: 'Station name', required: true, span2: true, placeholder: 'Station Alpha - Bay of Bengal' },
        { name: 'lat', label: 'Latitude', type: 'number', step: 'any', required: true, placeholder: '13.5' },
        { name: 'lng', label: 'Longitude', type: 'number', step: 'any', required: true, placeholder: '82.3' },
        { name: 'depth', label: 'Depth (m)', type: 'number', placeholder: '450' },
        { name: 'parameters', label: 'Parameters (comma separated)', placeholder: 'temperature, salinity, pH' },
        { name: 'description', label: 'Description', type: 'textarea', span2: true },
      ]}
      toForm={(s) => ({
        name: s.name, lat: s.coordinates?.lat ?? '', lng: s.coordinates?.lng ?? '', depth: s.depth ?? '',
        parameters: (s.parameters || []).join(', '), description: s.description || '',
      })}
      toPayload={(f) => {
        const p = {
          name: f.name,
          coordinates: { lat: Number(f.lat), lng: Number(f.lng) },
          parameters: f.parameters.split(',').map((x) => x.trim()).filter(Boolean),
          description: f.description,
        }
        if (f.depth !== '') p.depth = Number(f.depth)
        return p
      }}
    />
  )
}
