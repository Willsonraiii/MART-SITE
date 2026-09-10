import { useEffect, useMemo, useState } from 'react'
import { adminGet, adminSend } from '../../lib/apiClient'
import { formatNPR } from '../../data/store'
import { PAY_LABEL, STATUS_OPTIONS, statusLabel } from '../adminMeta'
import DataState from '../../components/DataState'

export default function OrdersPage() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const [open, setOpen] = useState(null)

  const load = () => {
    setError('')
    adminGet('/orders')
      .then(setOrders)
      .catch((err) => setError(err.message || 'Could not load orders.'))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const list = orders || []
    const t = q.trim().toLowerCase()
    if (!t) return list
    return list.filter((o) =>
      [o.id, o.customer?.fullName, o.customer?.phone, o.status, o.paymentMethod]
        .join(' ')
        .toLowerCase()
        .includes(t),
    )
  }, [orders, q])

  const changeStatus = async (id, status) => {
    setBusy(id)
    try {
      const next = await adminSend(`/orders/${id}`, 'PATCH', { status })
      setOrders((prev) => prev.map((o) => (o.id === id ? next : o)))
      setOpen((cur) => (cur?.id === id ? next : cur))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  if (orders == null && !error) return <DataState loading />
  if (error && orders == null) return <DataState error={error} onRetry={load} />

  return (
    <>
      <div className="admin-toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name, phone…" />
      </div>
      {error && <p className="admin-banner">{error}</p>}
      <div className="admin-card">
        <h2>Orders</h2>
        {!orders.length ? (
          <p className="admin-empty">No slips yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} onClick={() => setOpen(order)} style={{ cursor: 'pointer' }}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer?.fullName}</td>
                    <td>{order.customer?.phone}</td>
                    <td>{formatNPR(order.total)}</td>
                    <td>{PAY_LABEL[order.paymentMethod] || order.paymentMethod}</td>
                    <td>
                      <select
                        value={order.status}
                        disabled={busy === order.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-NP') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="admin-card">
          <h2>{open.id} · {statusLabel(open.status)}</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 10 }}>
            {open.customer?.fullName} · {open.customer?.phone}<br />
            {open.address?.line}, {open.address?.city}
          </p>
          {open.items?.map((item) => (
            <div key={item.id + item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{item.qty} × {item.name}</span>
              <span>{formatNPR(item.subtotal)}</span>
            </div>
          ))}
          <p style={{ marginTop: 12 }}><strong>Total {formatNPR(open.total)}</strong></p>
        </div>
      )}
    </>
  )
}
