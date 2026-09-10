import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGet } from '../../lib/apiClient'
import { formatNPR } from '../../data/store'
import DataState from '../../components/DataState'

export default function CustomersPage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    adminGet('/customers')
      .then(setRows)
      .catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    const list = rows || []
    const t = q.trim().toLowerCase()
    if (!t) return list
    return list.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(t))
  }, [rows, q])

  if (rows == null && !error) return <DataState loading />
  if (error && rows == null) return <DataState error={error} />

  return (
    <>
      <div className="admin-toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone…" />
      </div>
      <div className="admin-card">
        <h2>Customers · {filtered.length}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Recent order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.guest && <div style={{ color: 'var(--ink-3)', fontSize: '0.78rem' }}>Guest checkout</div>}
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.orderCount}</td>
                  <td>{formatNPR(c.totalSpent)}</td>
                  <td>
                    {c.recentOrder ? (
                      <Link to="/admin/orders">{c.recentOrder.id} · {formatNPR(c.recentOrder.total)}</Link>
                    ) : '—'}
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
