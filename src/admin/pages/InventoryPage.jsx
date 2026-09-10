import { useEffect, useMemo, useState } from 'react'
import { adminGet, adminSend } from '../../lib/apiClient'
import { formatNPR } from '../../data/store'
import { STOCK_OPTIONS } from '../adminMeta'
import DataState from '../../components/DataState'

export default function InventoryPage() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = () => {
    adminGet('/products')
      .then(setProducts)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    load()
  }, [])

  const counts = useMemo(() => {
    const list = products || []
    return {
      in: list.filter((p) => p.stock === 'in').length,
      low: list.filter((p) => p.stock === 'low').length,
      out: list.filter((p) => p.stock === 'out').length,
    }
  }, [products])

  const rows = useMemo(() => {
    const list = products || []
    if (filter === 'all') return list
    return list.filter((p) => p.stock === filter)
  }, [products, filter])

  const setStock = async (id, stock) => {
    try {
      const updated = await adminSend(`/products/${id}`, 'PATCH', { stock })
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (err) {
      setError(err.message)
    }
  }

  if (products == null && !error) return <DataState loading />
  if (error && products == null) return <DataState error={error} onRetry={load} />

  return (
    <>
      {counts.low + counts.out > 0 && (
        <p className="admin-banner">
          Low-stock warning: {counts.low} running low, {counts.out} out of stock.
        </p>
      )}
      <div className="admin-kpis">
        <article className="admin-kpi"><span>In stock</span><strong>{counts.in}</strong></article>
        <article className="admin-kpi warn"><span>Low stock</span><strong>{counts.low}</strong></article>
        <article className="admin-kpi alert"><span>Out of stock</span><strong>{counts.out}</strong></article>
      </div>
      <div className="admin-toolbar">
        {['all', 'in', 'low', 'out'].map((id) => (
          <button key={id} type="button" className="btn btn-ghost" onClick={() => setFilter(id)} style={filter === id ? { background: 'var(--forest)', color: 'var(--cream)' } : undefined}>
            {id === 'all' ? 'All' : STOCK_OPTIONS.find((s) => s.id === id)?.label}
          </button>
        ))}
      </div>
      <div className="admin-card">
        <h2>Inventory</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{formatNPR(p.price)}</td>
                  <td><span className={`admin-pill ${p.stock}`}>{p.stockLabel}</span></td>
                  <td>
                    <select value={p.stock} onChange={(e) => setStock(p.id, e.target.value)}>
                      {STOCK_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
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
