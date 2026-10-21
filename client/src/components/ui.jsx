import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'

/* ---------- icons ---------- */
const ICONS = {
  dashboard: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
  vessel: 'M3 17l2-6h14l2 6 M7 11V6h10v5 M12 6V3 M2 21c2.5 1.2 4 1.2 6.5 0s4-1.2 7 0 4 1.2 6.5 0',
  equipment: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  station: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  expedition: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16 8l-2 6-6 2 2-6z',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14',
  analytics: 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  plus: 'M12 5v14 M5 12h14',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v6 M14 11v6',
  x: 'M18 6L6 18 M6 6l12 12',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  alert: 'M12 9v4 M12 17h.01 M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
}
export function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/* ---------- status styling ---------- */
export const STATUS = {
  docked: { cls: 'bg-tide/15 text-tide', hex: '#58a6ff' },
  'at-sea': { cls: 'bg-glow/15 text-glow', hex: '#3fe0cf' },
  maintenance: { cls: 'bg-sodium/15 text-sodium', hex: '#f4a63c' },
  available: { cls: 'bg-kelp/15 text-kelp', hex: '#6fdc8c' },
  'in-use': { cls: 'bg-tide/15 text-tide', hex: '#58a6ff' },
  planned: { cls: 'bg-mist/15 text-mist', hex: '#8ba5b3' },
  ongoing: { cls: 'bg-glow/15 text-glow', hex: '#3fe0cf' },
  completed: { cls: 'bg-tide/15 text-tide', hex: '#58a6ff' },
  cancelled: { cls: 'bg-coral/15 text-coral', hex: '#ff6b6b' },
}
export function Badge({ status }) {
  const s = STATUS[status] || { cls: 'bg-mist/15 text-mist' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {String(status).replace('-', ' ')}
    </span>
  )
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

/* ---------- data hook ---------- */
export function useList(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(path)
      setItems(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load data. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [path])
  useEffect(() => { reload() }, [reload])
  return { items, loading, error, reload }
}

/* ---------- form controls ---------- */
export const inputCls =
  'w-full rounded-lg border border-line bg-deep px-3 py-2 text-sm text-foam placeholder:text-mist/60 focus:border-glow focus:outline-none focus:ring-1 focus:ring-glow'

export function Field({ label, children, span2 }) {
  return (
    <label className={`block ${span2 ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-sm font-medium text-mist">{label}</span>
      {children}
    </label>
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-glow text-abyss hover:bg-glow/90 font-semibold',
    ghost: 'border border-line text-foam hover:bg-ridge',
    danger: 'bg-coral text-abyss hover:bg-coral/90 font-semibold',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative w-full sm:w-72">
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
      <input
        className={`${inputCls} pl-9`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}

export function FilterChips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
      {[{ value: 'all', label: 'All' }, ...options].map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            value === o.value ? 'bg-glow text-abyss font-medium' : 'bg-trench text-mist hover:text-foam'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- layout pieces ---------- */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foam">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mist">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-trench ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-semibold text-foam">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function DataTable({ columns, rows, actions, loading, emptyTitle, emptyHint }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-trench">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-deep/60 text-mist">
              {columns.map((c) => (
                <th key={c.label} className="whitespace-nowrap px-4 py-3 font-medium">{c.label}</th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-line/60 last:border-0 hover:bg-ridge/40">
                {columns.map((c) => (
                  <td key={c.label} className={`px-4 py-3 ${c.className || ''}`}>{c.render(r)}</td>
                ))}
                {actions && <td className="whitespace-nowrap px-4 py-3 text-right">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="font-medium text-foam">{emptyTitle}</p>
          {emptyHint && <p className="mt-1 text-sm text-mist">{emptyHint}</p>}
        </div>
      )}
      {loading && <p className="px-6 py-8 text-center text-sm text-mist">Loading...</p>}
    </div>
  )
}

export function RowActions({ onEdit, onDelete }) {
  const btn = 'rounded-md p-1.5 text-mist transition-colors hover:bg-ridge'
  return (
    <div className="inline-flex gap-1">
      {onEdit && (
        <button onClick={onEdit} aria-label="Edit" className={`${btn} hover:text-glow`}>
          <Icon name="edit" className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} aria-label="Delete" className={`${btn} hover:text-coral`}>
          <Icon name="trash" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* ---------- modal + confirm ---------- */
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-abyss/80 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className={`modal-in w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-2xl border border-line bg-trench shadow-2xl shadow-black/50`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-foam">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-mist hover:bg-ridge hover:text-foam">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-mist">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

/* ---------- toasts ---------- */
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[3000] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`modal-in rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
            t.type === 'ok' ? 'border-glow/40 bg-trench text-foam' : 'border-coral/40 bg-trench text-coral'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ---------- depth contours (login backdrop) ---------- */
export function Contours({ className = '' }) {
  const lines = Array.from({ length: 16 }, (_, i) => {
    const pts = []
    for (let x = -120; x <= 1120; x += 20) {
      const y = 40 + i * 38 + Math.sin(x / 140 + i * 0.55) * 22 + Math.sin(x / 61 + i) * 7
      pts.push(`${x},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  })
  return (
    <svg className={className} viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="drift" fill="none" strokeLinejoin="round">
        {lines.map((p, i) => (
          <polyline key={i} points={p} stroke="#3fe0cf" strokeOpacity={0.05 + (i % 4) * 0.045} strokeWidth="1.4" />
        ))}
      </g>
    </svg>
  )
}
