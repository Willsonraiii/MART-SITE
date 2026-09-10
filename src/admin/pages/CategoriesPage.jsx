import { useEffect, useState } from 'react'
import { adminGet, adminSend } from '../../lib/apiClient'
import { TONES } from '../adminMeta'
import DataState from '../../components/DataState'

export default function CategoriesPage() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', tone: 'leaf' })
  const [editing, setEditing] = useState(null)

  const load = () => {
    setError('')
    adminGet('/categories')
      .then(setList)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const updated = await adminSend(`/categories/${editing}`, 'PATCH', form)
        setList((prev) => prev.map((c) => (c.id === editing ? updated : c)))
        setEditing(null)
      } else {
        const created = await adminSend('/categories', 'POST', form)
        setList((prev) => [...prev, created])
      }
      setForm({ name: '', tone: 'leaf' })
    } catch (err) {
      setError(err.message)
    }
  }

  const move = async (index, dir) => {
    const next = list.slice()
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setList(next)
    try {
      const saved = await adminSend('/categories/reorder', 'PUT', { ids: next.map((c) => c.id) })
      setList(saved)
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this aisle?')) return
    try {
      await adminSend(`/categories/${id}`, 'DELETE')
      setList((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (list == null && !error) return <DataState loading />
  if (error && list == null) return <DataState error={error} onRetry={load} />

  return (
    <>
      {error && <p className="admin-banner">{error}</p>}
      <form className="admin-card admin-form" onSubmit={save}>
        <h2>{editing ? 'Edit aisle' : 'New aisle'}</h2>
        <div className="admin-form-grid">
          <label className="admin-field">Name<input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></label>
          <label className="admin-field">
            Tone
            <select value={form.tone} onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <div className="admin-actions">
          <button className="btn" type="submit">{editing ? 'Save' : 'Create'}</button>
          {editing && (
            <button className="btn btn-ghost" type="button" onClick={() => { setEditing(null); setForm({ name: '', tone: 'leaf' }) }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-card">
        <h2>Categories</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Tone</th>
                <th>Products</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(list || []).map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => move(i, -1)}>↑</button>
                      <button className="btn btn-ghost" type="button" onClick={() => move(i, 1)}>↓</button>
                    </div>
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.tone}</td>
                  <td>{c.count}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => { setEditing(c.id); setForm({ name: c.name, tone: c.tone }) }}>Edit</button>
                      <button className="btn btn-ghost" type="button" onClick={() => remove(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
