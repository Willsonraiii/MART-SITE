import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGet } from '../../lib/apiClient'
import { formatNPR } from '../../data/store'
import SalesChart from '../SalesChart'
import DataState from '../../components/DataState'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [range, setRange] = useState('daily')

  const load = () => {
    setError('')
    adminGet('/stats')
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load the desk.'))
  }

  useEffect(() => {
    load()
  }, [])

  if (error) {
    const needsSignIn = /sign in/i.test(error)
    return (
      <div className="data-state">
        <p className="eyebrow">Shopkeeper desk</p>
        <h2>{needsSignIn ? 'Please sign in again.' : 'We couldn’t load the desk.'}</h2>
        <p>{needsSignIn ? 'Your session did not stick in this preview. Sign in once more.' : error}</p>
        {needsSignIn ? (
          <Link className="btn" to="/login" state={{ from: '/admin' }}>Sign in</Link>
        ) : (
          <button className="btn" type="button" onClick={load}>Try again</button>
        )}
      </div>
    )
  }

  if (!data) {
    return <DataState loading />
  }

  const series = data.charts?.[range] || []

  return (
    <>
      {data.lowStock > 0 && (
        <p className="admin-banner">
          {data.lowStock} product{data.lowStock === 1 ? '' : 's'} running low
          {data.outOfStock ? ` · ${data.outOfStock} out of stock` : ''}.{' '}
          <Link to="/admin/inventory" style={{ color: 'inherit', textDecoration: 'underline' }}>Check inventory</Link>
        </p>
      )}
      <div className="admin-kpis">
        <article className="admin-kpi">
          <span>Today’s sales</span>
          <strong>{formatNPR(data.todaySales)}</strong>
        </article>
        <article className="admin-kpi">
          <span>Today’s orders</span>
          <strong>{data.todayOrders}</strong>
        </article>
        <article className="admin-kpi">
          <span>Pending orders</span>
          <strong>{data.pendingOrders}</strong>
        </article>
        <article className={`admin-kpi ${data.lowStock ? 'warn' : ''}`}>
          <span>Low stock</span>
          <strong>{data.lowStock}</strong>
        </article>
        <article className="admin-kpi">
          <span>Total products</span>
          <strong>{data.totalProducts}</strong>
        </article>
      </div>

      <div className="admin-card">
        <h2>Sales</h2>
        <div className="admin-chart-tabs">
          {['daily', 'weekly', 'monthly'].map((id) => (
            <button key={id} type="button" className={range === id ? 'is-on' : ''} onClick={() => setRange(id)}>
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        {series.every((p) => !p.sales) ? (
          <p className="admin-empty">No sales in this window yet — the till is waiting.</p>
        ) : (
          <SalesChart series={series} />
        )}
      </div>
    </>
  )
}
