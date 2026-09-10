import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataState from '../components/DataState'
import OrderSummary from '../components/OrderSummary'
import { useCart } from '../context/CartContext'
import { formatNPR } from '../data/store'
import Seo from '../components/Seo'
import { loadOrder } from '../lib/cart'
import { fetchOrder, mapApiOrder } from '../lib/apiClient'
import './CartPage.css'

const PAY_LABEL = {
  cod: 'Cash on Delivery',
  esewa: 'eSewa (demo — not charged)',
  khalti: 'Khalti (demo — not charged)',
  fonepay: 'Fonepay (demo — not charged)',
}

export default function ConfirmationPage() {
  const { id } = useParams()
  const { lastOrder } = useCart()
  const cached = lastOrder && lastOrder.id === id ? lastOrder : loadOrder()?.id === id ? loadOrder() : null
  const [order, setOrder] = useState(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    setError('')
    if (!cached) setLoading(true)
    fetchOrder(id, { signal: ac.signal })
      .then((data) => {
        setOrder(mapApiOrder(data))
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        if (!cached) {
          setError(err.status === 404 ? '' : err.message || 'Could not load that order.')
          setOrder(null)
        }
        setLoading(false)
      })
    return () => ac.abort()
  }, [id])

  if (loading) {
    return (
      <section className="confirm-page">
        <div className="wrap">
          <DataState loading />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="confirm-page">
        <div className="wrap">
          <DataState error={error} />
        </div>
      </section>
    )
  }

  if (!order || order.id !== id) {
    return (
      <section className="confirm-page">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow">No slip</p>
          <h1>We couldn’t find that order.</h1>
          <p style={{ margin: '12px 0 20px', color: 'var(--ink-2)' }}>It may have been on another device.</p>
          <Link className="btn" to="/shop">Continue Shopping</Link>
        </div>
      </section>
    )
  }

  const { customer, items, totals, payment, eta } = order

  return (
    <section className="confirm-page">
      <Seo title={`Order ${order.id} — Yalamber Mini Mart`} description="Your order slip from Yalamber Mini Mart." path={`/order/${order.id}`} />
      <div className="wrap">
        <div className="confirm-hero">
          <div className="confirm-mark" aria-hidden="true">✓</div>
          <p className="eyebrow">Packed for the road</p>
          <h1>Order Confirmed!</h1>
          <p className="confirm-id">{order.id}</p>
          <p style={{ color: 'var(--ink-2)', marginTop: 8 }}>
            A neighborhood run from New Baneshwor. Estimated delivery: {eta}.
          </p>
        </div>

        <div className="confirm-grid">
          <div className="confirm-card">
            <h3>Products</h3>
            {items.map((item) => (
              <article className="confirm-line" key={item.id}>
                <img src={item.image} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>
                    {item.qty} × {formatNPR(item.price)}
                  </div>
                </div>
                <span className="price">{formatNPR(item.subtotal)}</span>
              </article>
            ))}
          </div>

          <div>
            <OrderSummary totals={totals} />
            <div className="confirm-card" style={{ marginTop: 12 }}>
              <h3>Delivery</h3>
              <p><strong>{customer.fullName}</strong></p>
              <p>{customer.phone}</p>
              <p>{customer.address}</p>
              {customer.landmark && <p>Near {customer.landmark}</p>}
              <p>{customer.city}</p>
              {customer.notes && <p style={{ marginTop: 8, color: 'var(--ink-2)' }}>Note: {customer.notes}</p>}
              <p style={{ marginTop: 12 }}>
                <strong>Payment:</strong> {PAY_LABEL[payment] || payment}
              </p>
              <p><strong>ETA:</strong> {eta}</p>
            </div>
            <Link className="btn" to="/shop" style={{ width: '100%', marginTop: 12 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
