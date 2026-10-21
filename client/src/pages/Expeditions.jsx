import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Badge, Button, ConfirmModal, DataTable, ErrorNote, Field, FilterChips, Icon, Modal,
  PageHeader, RowActions, SearchBox, fmtDate, inputCls, useList, useToast,
} from '../components/ui'

const empty = {
  title: '', description: '', startDate: '', endDate: '', status: 'planned',
  vesselId: '', leadScientistId: '', crewIds: [], equipmentIds: [], stationIds: [],
}
const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function Checklist({ label, items, selected, onToggle, nameOf }) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1.5 text-sm font-medium text-mist">
        {label} <span className="text-mist/60">({selected.length} selected)</span>
      </legend>
      <div className="flex max-h-32 flex-wrap gap-2 overflow-auto rounded-lg border border-line bg-deep p-2.5">
        {items.length === 0 && <span className="text-sm text-mist/70">Nothing to choose from yet.</span>}
        {items.map((it) => {
          const on = selected.includes(it._id)
          return (
            <label
              key={it._id}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                on ? 'border-glow bg-glow/15 text-glow' : 'border-line text-mist hover:text-foam'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggle(it._id)} />
              {nameOf(it)}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function Expeditions() {
  const { user } = useAuth()
  const toast = useToast()
  const canWrite = ['admin', 'scientist'].includes(user.role)
  const canDelete = user.role === 'admin'

  const exp = useList('/expeditions')
  const vessels = useList('/vessels')
  const users = useList('/users')
  const equipment = useList('/equipment')
  const stations = useList('/stations')

  const [query, setQuery] = useState('')
  const [chip, setChip] = useState('all')
  const [editing, setEditing] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const rows = exp.items.filter(
    (x) =>
      (chip === 'all' || x.status === chip) &&
      `${x.title} ${x.vesselId?.name || ''} ${x.leadScientistId?.name || ''}`.toLowerCase().includes(query.toLowerCase())
  )

  const leads = users.items.filter((u) => ['scientist', 'admin'].includes(u.role))
  const crew = users.items.filter((u) => ['captain', 'crew'].includes(u.role))

  const setField = (k, v) => setEditing((e) => ({ ...e, form: { ...e.form, [k]: v } }))
  const toggle = (k, id) =>
    setEditing((e) => {
      const list = e.form[k]
      return { ...e, form: { ...e.form, [k]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } }
    })

  const openAdd = () => { setFormError(''); setEditing({ id: null, form: empty }) }
  const openEdit = (x) => {
    setFormError('')
    setEditing({
      id: x._id,
      form: {
        title: x.title, description: x.description || '',
        startDate: x.startDate ? x.startDate.slice(0, 10) : '',
        endDate: x.endDate ? x.endDate.slice(0, 10) : '',
        status: x.status,
        vesselId: x.vesselId?._id || '', leadScientistId: x.leadScientistId?._id || '',
        crewIds: (x.crewIds || []).map((c) => c._id),
        equipmentIds: (x.equipmentIds || []).map((c) => c._id),
        stationIds: (x.stationIds || []).map((c) => c._id),
      },
    })
  }

  const save = async (e) => {
    e.preventDefault()
    const f = editing.form
    if (f.endDate < f.startDate) return setFormError('The end date cannot be before the start date.')
    setFormError('')
    setSaving(true)
    try {
      if (editing.id) await api.put(`/expeditions/${editing.id}`, f)
      else await api.post('/expeditions', f)
      toast(editing.id ? 'Expedition updated' : 'Expedition planned')
      setEditing(null)
      exp.reload()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save. Check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/expeditions/${deleting._id}`)
      toast('Expedition deleted')
      setDeleting(null)
      exp.reload()
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete', 'error')
      setDeleting(null)
    } finally {
      setSaving(false)
    }
  }

  const count = (a) => a?.length || 0

  return (
    <div>
      <PageHeader
        title="Expeditions"
        subtitle={exp.loading ? ' ' : `${exp.items.length} on record`}
        action={canWrite && <Button onClick={openAdd}><Icon name="plus" className="h-4 w-4" />Plan expedition</Button>}
      />
      <ErrorNote>{exp.error}</ErrorNote>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips options={statusOptions} value={chip} onChange={setChip} />
        <SearchBox value={query} onChange={setQuery} placeholder="Search expeditions" />
      </div>

      <DataTable
        loading={exp.loading}
        rows={rows}
        columns={[
          { label: 'Expedition', render: (x) => <span className="font-medium text-foam">{x.title}</span> },
          { label: 'Vessel', className: 'whitespace-nowrap', render: (x) => x.vesselId?.name || '-' },
          { label: 'Lead scientist', className: 'whitespace-nowrap', render: (x) => x.leadScientistId?.name || '-' },
          { label: 'Dates', className: 'whitespace-nowrap text-mist', render: (x) => `${fmtDate(x.startDate)} to ${fmtDate(x.endDate)}` },
          { label: 'Status', render: (x) => <Badge status={x.status} /> },
          {
            label: 'Team and kit', className: 'whitespace-nowrap text-mist',
            render: (x) => `${count(x.crewIds)} crew, ${count(x.equipmentIds)} instruments, ${count(x.stationIds)} stations`,
          },
        ]}
        actions={(canWrite || canDelete) && ((x) => (
          <RowActions onEdit={canWrite ? () => openEdit(x) : null} onDelete={canDelete ? () => setDeleting(x) : null} />
        ))}
        emptyTitle={exp.items.length === 0 ? 'No expeditions yet' : 'Nothing matches your search'}
        emptyHint={exp.items.length === 0 ? 'Plan the first expedition: choose a vessel, a lead scientist, instruments and stations.' : 'Try a different word or clear the filter.'}
      />

      {editing && (
        <Modal wide title={editing.id ? 'Edit expedition' : 'Plan expedition'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><ErrorNote>{formError}</ErrorNote></div>
            <Field label="Title" span2>
              <input className={inputCls} value={editing.form.title} onChange={(e) => setField('title', e.target.value)} required placeholder="Bay of Bengal Coastal Survey" />
            </Field>
            <Field label="Description" span2>
              <textarea rows={2} className={inputCls} value={editing.form.description} onChange={(e) => setField('description', e.target.value)} />
            </Field>
            <Field label="Start date">
              <input type="date" className={inputCls} value={editing.form.startDate} onChange={(e) => setField('startDate', e.target.value)} required />
            </Field>
            <Field label="End date">
              <input type="date" className={inputCls} value={editing.form.endDate} onChange={(e) => setField('endDate', e.target.value)} required />
            </Field>
            <Field label="Vessel">
              <select className={inputCls} value={editing.form.vesselId} onChange={(e) => setField('vesselId', e.target.value)} required>
                <option value="">Choose a vessel</option>
                {vessels.items.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.registrationNumber})</option>)}
              </select>
            </Field>
            <Field label="Lead scientist">
              <select className={inputCls} value={editing.form.leadScientistId} onChange={(e) => setField('leadScientistId', e.target.value)} required>
                <option value="">Choose a lead</option>
                {leads.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={editing.form.status} onChange={(e) => setField('status', e.target.value)}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <div />
            <Checklist label="Crew" items={crew} selected={editing.form.crewIds} onToggle={(id) => toggle('crewIds', id)} nameOf={(u) => u.name} />
            <Checklist label="Instruments" items={equipment.items} selected={editing.form.equipmentIds} onToggle={(id) => toggle('equipmentIds', id)} nameOf={(i) => i.name} />
            <Checklist label="Sampling stations" items={stations.items} selected={editing.form.stationIds} onToggle={(id) => toggle('stationIds', id)} nameOf={(s) => s.name} />
            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save expedition'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmModal
          title="Delete this expedition?"
          message={`"${deleting.title}" will be removed permanently. This cannot be undone.`}
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} busy={saving}
        />
      )}
    </div>
  )
}
