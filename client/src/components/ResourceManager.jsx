import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Button, ConfirmModal, DataTable, ErrorNote, Field, FilterChips, Icon, Modal,
  PageHeader, RowActions, SearchBox, inputCls, useList, useToast,
} from './ui'

// One screen for list + search + filter + add/edit modal + delete confirmation.
// Vessels, Equipment and Stations are all described by a small config object.
export default function ResourceManager({
  title, noun, path, columns, fields, emptyForm, toForm, toPayload,
  searchText, filter, can, emptyHint,
}) {
  const { user } = useAuth()
  const toast = useToast()
  const { items, loading, error, reload } = useList(path)
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState('all')
  const [editing, setEditing] = useState(null) // { id, form }
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const allowed = {
    create: can.create.includes(user.role),
    edit: can.edit.includes(user.role),
    delete: can.delete.includes(user.role),
  }

  const rows = items.filter(
    (r) =>
      (chip === 'all' || filter.get(r) === chip) &&
      searchText(r).toLowerCase().includes(query.toLowerCase())
  )

  const openAdd = () => { setFormError(''); setEditing({ id: null, form: emptyForm }) }
  const openEdit = (r) => { setFormError(''); setEditing({ id: r._id, form: toForm(r) }) }
  const setField = (name, value) =>
    setEditing((e) => ({ ...e, form: { ...e.form, [name]: value } }))

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const payload = toPayload(editing.form)
      if (editing.id) await api.put(`${path}/${editing.id}`, payload)
      else await api.post(path, payload)
      toast(editing.id ? `${noun} updated` : `${noun} added`)
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save. Check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`${path}/${deleting._id}`)
      toast(`${noun} deleted`)
      setDeleting(null)
      reload()
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete', 'error')
      setDeleting(null)
    } finally {
      setSaving(false)
    }
  }

  const hasActions = allowed.edit || allowed.delete

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={loading ? ' ' : `${items.length} ${items.length === 1 ? noun.toLowerCase() : title.toLowerCase()} on record`}
        action={allowed.create && (
          <Button onClick={openAdd}><Icon name="plus" className="h-4 w-4" />Add {noun.toLowerCase()}</Button>
        )}
      />
      <ErrorNote>{error}</ErrorNote>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips options={filter.options} value={chip} onChange={setChip} />
        <SearchBox value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}`} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        actions={hasActions && ((r) => (
          <RowActions
            onEdit={allowed.edit ? () => openEdit(r) : null}
            onDelete={allowed.delete ? () => setDeleting(r) : null}
          />
        ))}
        emptyTitle={items.length === 0 ? `No ${title.toLowerCase()} yet` : 'Nothing matches your search'}
        emptyHint={items.length === 0 ? emptyHint : 'Try a different word or clear the filter.'}
      />

      {editing && (
        <Modal title={editing.id ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><ErrorNote>{formError}</ErrorNote></div>
            {fields.map((f) => (
              <Field key={f.name} label={f.label} span2={f.span2}>
                {f.type === 'select' ? (
                  <select className={inputCls} value={editing.form[f.name]} onChange={(e) => setField(f.name, e.target.value)}>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} className={inputCls} value={editing.form[f.name]} onChange={(e) => setField(f.name, e.target.value)} placeholder={f.placeholder} />
                ) : (
                  <input
                    className={inputCls} type={f.type || 'text'} step={f.step} placeholder={f.placeholder}
                    value={editing.form[f.name]} required={f.required}
                    onChange={(e) => setField(f.name, e.target.value)}
                  />
                )}
              </Field>
            ))}
            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmModal
          title={`Delete this ${noun.toLowerCase()}?`}
          message={`"${deleting.name}" will be removed permanently. This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={saving}
        />
      )}
    </div>
  )
}
