import { useEffect, useState } from 'react'
import { adminGet, adminSend } from '../../lib/apiClient'
import { OFFER_KINDS } from '../adminMeta'
import DataState from '../../components/DataState'

const empty = {
  title: '',
  kicker: "Today's Deal",
  kind: 'percent',
  percent: 10,
  amount: 20,
  buyQty: 2,
  getQty: 1,
  tag: '',
  detail: '',
  cta: 'Shop now',
  to: '/shop',
  theme: 'leaf',
  categoryId: '',
  active: true,
}

export default function OffersPage() {
  const [offers, setOffers] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)

  const load = () => {
    Promise.all([adminGet('/offers'), adminGet('/categories')])
      .then(([list, cats]) => {
        setOffers(list)
        setCategories(cats)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    load()
  }, [])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      percent: Number(form.percent),
      amount: Number(form.amount),
      buyQty: Number(form.buyQty),
      getQty: Number(form.getQty),
      categoryId: form.categoryId || null,
    }
    try {
      if (editing) {
        const updated = await adminSend(`/offers/${editing}`, 'PATCH', payload)
        setOffers((prev) => prev.map((o) => (o.id === editing ? updated : o)))
      } else {
        const created = await adminSend('/offers', 'POST', payload)
        setOffers((prev) => [...prev, created])
      }
      setEditing(null)
      setForm(empty)
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (o) => {
    setEditing(o.id)
    setForm({
      title: o.title,
      kicker: o.kicker || '',
      kind: o.kind || 'banner',
      percent: o.percent || 10,
      amount: o.amount || 20,
      buyQty: o.buyQty || 2,
      getQty: o.getQty || 1,
      tag: o.tag || '',
      detail: o.detail || '',
      cta: o.cta || 'Shop now',
      to: o.to || '/shop',
      theme: o.theme || 'leaf',
      categoryId: o.categoryId || '',
      active: o.active !== false,
    })
  }

  const remove = async (id) => {
    if (!window.confirm('Take this offer down?')) return
    try {
      await adminSend(`/offers/${id}`, 'DELETE')
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (offers == null && !error) return <DataState loading />
  if (error && offers == null) return <DataState error={error} onRetry={load} />

  return (
    <>
      {error && <p className="admin-banner">{error}</p>}
      <form className="admin-card admin-form" onSubmit={save}>
        <h2>{editing ? 'Edit offer' : 'New offer'}</h2>
        <div className="admin-form-grid">
          <label className="admin-field">Title<input value={form.title} onChange={set('title')} required /></label>
          <label className="admin-field">Kicker<input value={form.kicker} onChange={set('kicker')} /></label>
          <label className="admin-field">
            Type
            <select value={form.kind} onChange={set('kind')}>
              {OFFER_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </label>
          {form.kind === 'percent' && (
            <label className="admin-field">Percent<input type="number" min="1" max="90" value={form.percent} onChange={set('percent')} /></label>
          )}
          {form.kind === 'fixed' && (
            <label className="admin-field">Amount (Rs.)<input type="number" min="1" value={form.amount} onChange={set('amount')} /></label>
          )}
          {form.kind === 'bogo' && (
            <>
              <label className="admin-field">Buy X<input type="number" min="1" value={form.buyQty} onChange={set('buyQty')} /></label>
              <label className="admin-field">Get Y<input type="number" min="1" value={form.getQty} onChange={set('getQty')} /></label>
            </>
          )}
          <label className="admin-field">
            Aisle
            <select value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Any</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="admin-field">Link<input value={form.to} onChange={set('to')} /></label>
        </div>
        <label className="admin-field">Detail<textarea value={form.detail} onChange={set('detail')} /></label>
        <label className="admin-check">
          <input type="checkbox" checked={form.active} onChange={set('active')} />
          Active on the shopfront
        </label>
        <div className="admin-actions">
          <button className="btn" type="submit">{editing ? 'Save' : 'Create offer'}</button>
          {editing && <button className="btn btn-ghost" type="button" onClick={() => { setEditing(null); setForm(empty) }}>Cancel</button>}
        </div>
      </form>

      <div className="admin-card">
        <h2>Offers</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Tag</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(offers || []).map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.title}</strong></td>
                  <td>{OFFER_KINDS.find((k) => k.id === o.kind)?.label || o.kind}</td>
                  <td>{o.tag}</td>
                  <td>{o.active ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => startEdit(o)}>Edit</button>
                      <button className="btn btn-ghost" type="button" onClick={() => remove(o.id)}>Delete</button>
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
