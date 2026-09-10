import { useEffect, useMemo, useState } from 'react'
import { adminGet, adminSend, adminUpload } from '../../lib/apiClient'
import { formatNPR } from '../../data/store'
import { STOCK_OPTIONS } from '../adminMeta'
import DataState from '../../components/DataState'

const empty = {
  name: '',
  brand: '',
  category: '',
  price: '',
  originalPrice: '',
  discount: 0,
  stock: 'in',
  unit: '',
  description: '',
  image: '',
  featured: false,
  note: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setError('')
    Promise.all([adminGet('/products'), adminGet('/categories')])
      .then(([list, cats]) => {
        setProducts(list)
        setCategories(cats)
      })
      .catch((err) => setError(err.message || 'Could not load products.'))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const list = products || []
    const t = q.trim().toLowerCase()
    if (!t) return list
    return list.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(t))
  }, [products, q])

  const startNew = () => {
    setEditing('new')
    setForm({ ...empty, category: categories[0]?.id || '' })
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name,
      brand: p.brand || '',
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || '',
      discount: p.discount || 0,
      stock: p.stock,
      unit: p.unit || p.weight || '',
      description: p.description || '',
      image: p.image || '',
      featured: Boolean(p.featured),
      note: p.note || '',
    })
  }

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await adminUpload(file)
      setForm((f) => ({ ...f, image: data.url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
      discount: Number(form.discount) || 0,
    }
    try {
      if (editing === 'new') {
        const created = await adminSend('/products', 'POST', payload)
        setProducts((prev) => [created, ...(prev || [])])
      } else {
        const updated = await adminSend(`/products/${editing}`, 'PATCH', payload)
        setProducts((prev) => prev.map((p) => (p.id === editing ? updated : p)))
      }
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this product from the rack?')) return
    try {
      await adminSend(`/products/${id}`, 'DELETE')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (products == null && !error) return <DataState loading />
  if (error && products == null) return <DataState error={error} onRetry={load} />

  return (
    <>
      <div className="admin-toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" />
        <button className="btn" type="button" onClick={startNew}>Add product</button>
      </div>
      {error && <p className="admin-banner">{error}</p>}

      {editing && (
        <form className="admin-card admin-form" onSubmit={save}>
          <h2>{editing === 'new' ? 'New product' : 'Edit product'}</h2>
          <div className="admin-form-grid">
            <label className="admin-field">Name<input value={form.name} onChange={set('name')} required /></label>
            <label className="admin-field">Brand<input value={form.brand} onChange={set('brand')} /></label>
            <label className="admin-field">
              Category
              <select value={form.category} onChange={set('category')}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="admin-field">Unit / weight<input value={form.unit} onChange={set('unit')} placeholder="70 g" /></label>
            <label className="admin-field">Price (Rs.)<input type="number" min="0" step="1" value={form.price} onChange={set('price')} /></label>
            <label className="admin-field">Original price<input type="number" min="0" step="1" value={form.originalPrice} onChange={set('originalPrice')} /></label>
            <label className="admin-field">Discount %<input type="number" min="0" max="90" value={form.discount} onChange={set('discount')} /></label>
            <label className="admin-field">
              Stock
              <select value={form.stock} onChange={set('stock')}>
                {STOCK_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <label className="admin-field">Description<textarea value={form.description} onChange={set('description')} /></label>
          <label className="admin-field">
            Image
            <input value={form.image} onChange={set('image')} placeholder="/images/… or upload" />
          </label>
          <label className="admin-field">
            Upload photo
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
          </label>
          {form.image && <img className="admin-preview" src={form.image} alt="" />}
          <label className="admin-check">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} />
            Mark featured
          </label>
          <div className="admin-actions">
            <button className="btn" type="submit" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card">
        <h2>Products · {filtered.length}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.image && <img className="admin-thumb" src={p.image} alt="" />}</td>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ color: 'var(--ink-3)', fontSize: '0.8rem' }}>{p.brand}</div>
                  </td>
                  <td>{categories.find((c) => c.id === p.category)?.name || p.category}</td>
                  <td>
                    {p.originalPrice ? <s style={{ color: 'var(--ink-3)' }}>{formatNPR(p.originalPrice)}</s> : null}{' '}
                    {formatNPR(p.price)}
                    {p.discount > 0 ? ` · ${p.discount}%` : ''}
                  </td>
                  <td><span className={`admin-pill ${p.stock}`}>{p.stockLabel}</span></td>
                  <td>{p.featured ? 'Yes' : '—'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn-ghost" type="button" onClick={() => remove(p.id)}>Delete</button>
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
