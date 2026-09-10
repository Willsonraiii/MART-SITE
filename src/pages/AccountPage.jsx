import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchMyOrders, mapApiOrder } from '../lib/apiClient'
import { formatNPR } from '../data/store'
import DataState from '../components/DataState'
import Seo from '../components/Seo'
import './CartPage.css'

export default function AccountPage() {
  const { user, ready, logout, updateProfile } = useAuth()
  const [form, setForm] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderError, setOrderError] = useState('')
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || 'New Baneshwor',
      landmark: user.landmark || '',
    })
  }, [user])

  useEffect(() => {
    if (!user) return undefined
    const ac = new AbortController()
    setLoadingOrders(true)
    fetchMyOrders({ signal: ac.signal })
      .then((data) => {
        setOrders((data || []).map(mapApiOrder))
        setOrderError('')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setOrderError(err.message || 'Could not load orders.')
      })
      .finally(() => setLoadingOrders(false))
    return () => ac.abort()
  }, [user])

  if (!ready) {
    return (
      <section className="checkout-page">
        <div className="wrap"><DataState loading /></div>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!form) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      await updateProfile(form)
      setSaved('Profile saved.')
    } catch (err) {
      setError(err.message || 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="checkout-page">
      <Seo title="Your account — Yalamber Mini Mart" description="Profile and order history at Yalamber Mini Mart." path="/account" />
      <div className="wrap">
        <p className="eyebrow">{user.role === 'admin' ? 'Shopkeeper' : 'Your account'}</p>
        <h1>{user.name}</h1>
        <p style={{ color: 'var(--ink-2)' }}>{user.email} · {user.phone}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <Link className="btn" to="/shop">Go to the shop</Link>
          {user.role === 'admin' && (
            <Link className="btn btn-ghost" to="/admin">Shopkeeper desk</Link>
          )}
        </div>

        <div className="checkout-layout" style={{ marginTop: 28 }}>
          <form className="checkout-form" onSubmit={save}>
            <h3 style={{ fontSize: '1.1rem' }}>Profile</h3>
            {error && <p className="error">{error}</p>}
            {saved && <p className="pay-note" style={{ color: 'var(--leaf)' }}>{saved}</p>}
            <label>
              Full name
              <input value={form.name} onChange={set('name')} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={set('phone')} />
            </label>
            <label>
              Address
              <textarea value={form.address} onChange={set('address')} />
            </label>
            <label>
              City / area
              <input value={form.city} onChange={set('city')} />
            </label>
            <label>
              Landmark
              <input value={form.landmark} onChange={set('landmark')} />
            </label>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save profile'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={logout}>
              Sign out
            </button>
          </form>

          <aside className="cart-side">
            <div className="confirm-card">
              <h3>Order history</h3>
              {loadingOrders && <p className="pay-note">Loading slips…</p>}
              {orderError && <p className="error">{orderError}</p>}
              {!loadingOrders && !orders.length && (
                <p className="pay-note">No orders yet. The noodles are waiting.</p>
              )}
              {orders.map((order) => (
                <Link key={order.id} to={`/order/${order.id}`} className="confirm-line" style={{ textDecoration: 'none' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>{order.id}</strong>
                    <div style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>
                      {order.status} · {formatNPR(order.totals.total)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {user.role === 'admin' && (
              <Link className="btn" to="/admin">Open shopkeeper desk</Link>
            )}
            <Link className="btn btn-ghost" to="/shop">Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
