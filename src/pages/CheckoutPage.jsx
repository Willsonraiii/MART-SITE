import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import OrderSummary from '../components/OrderSummary'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatNPR } from '../data/store'
import Seo from '../components/Seo'
import './CartPage.css'

const AREAS = [
  'New Baneshwor',
  'Baneshwor',
  'Old Baneshwor',
  'Koteshwor',
  'Tinkune',
  'Sinamangal',
  'Minbhawan',
  'Thapathali',
  'Battisputali',
  'Gairigaun',
]

const PAYMENTS = [
  { id: 'cod', name: 'Cash on Delivery', hint: 'Pay when the bag arrives' },
  { id: 'esewa', name: 'eSewa', hint: 'Shown for layout — not charged' },
  { id: 'khalti', name: 'Khalti', hint: 'Shown for layout — not charged' },
  { id: 'fonepay', name: 'Fonepay', hint: 'Shown for layout — not charged' },
]

const empty = {
  fullName: '',
  phone: '',
  address: '',
  landmark: '',
  city: 'New Baneshwor',
  notes: '',
}

function validate(form) {
  const errors = {}
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.'
  } else if (!/^[\p{L}\s.'-]+$/u.test(form.fullName.trim())) {
    errors.fullName = 'Use letters only in the name.'
  }
  const phone = form.phone.replace(/[\s-]/g, '')
  if (!/^(?:\+977)?9\d{9}$/.test(phone)) {
    errors.phone = 'Enter a valid Nepal mobile number.'
  }
  if (!form.address.trim() || form.address.trim().length < 6) {
    errors.address = 'Add a delivery address we can find.'
  }
  if (!form.city) errors.city = 'Choose an area.'
  return errors
}

export default function CheckoutPage() {
  const { cart, totals, placeOrder } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [tried, setTried] = useState(false)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.name || '',
      phone: f.phone || user.phone || '',
      address: f.address || user.address || '',
      city: f.city || user.city || 'New Baneshwor',
      landmark: f.landmark || user.landmark || '',
    }))
  }, [user])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const liveErrors = useMemo(() => (tried ? validate(form) : {}), [form, tried])

  if (!cart.length && !placing) return <Navigate to="/cart" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (placing) return
    setTried(true)
    const next = validate(form)
    setErrors(next)
    if (Object.keys(next).length) return

    setPlacing(true)
    try {
      const order = await placeOrder({
        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          landmark: form.landmark.trim(),
          city: form.city,
          notes: form.notes.trim(),
        },
        payment,
      })
      if (order) navigate(`/order/${order.id}`)
      else setPlacing(false)
    } catch {
      setPlacing(false)
    }
  }

  const shown = { ...errors, ...liveErrors }

  return (
    <section className="checkout-page">
      <Seo title="Checkout — Yalamber Mini Mart" description="Tell us where to bring the bag. New Baneshwor delivery." path="/checkout" />
      <div className="wrap">
        <p className="eyebrow">Almost there</p>
        <h1>Checkout</h1>
        <p style={{ color: 'var(--ink-2)' }}>
          Tell us where to bring the bag. No payment is taken in this demo.
          {!user && (
            <>
              {' '}
              <Link to="/login" state={{ from: '/checkout' }} style={{ color: 'var(--leaf)', fontWeight: 600 }}>
                Sign in
              </Link>
              {' '}to keep this order on your account.
            </>
          )}
        </p>

        <form className="checkout-layout" onSubmit={submit} noValidate>
          <div className="checkout-form">
            <label className={`field ${shown.fullName ? 'has-error' : ''}`}>
              Full name
              <input
                autoComplete="name"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Sita Sharma"
              />
              {shown.fullName && <span className="error">{shown.fullName}</span>}
            </label>
            <label className={`field ${shown.phone ? 'has-error' : ''}`}>
              Phone number
              <input
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="98XXXXXXXX"
              />
              {shown.phone && <span className="error">{shown.phone}</span>}
            </label>
            <label className={`field ${shown.address ? 'has-error' : ''}`}>
              Delivery address
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="House / flat, street, nearby shop"
              />
              {shown.address && <span className="error">{shown.address}</span>}
            </label>
            <label>
              Landmark <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>(optional)</span>
              <input
                value={form.landmark}
                onChange={set('landmark')}
                placeholder="Opposite the petrol pump"
              />
            </label>
            <label className={`field ${shown.city ? 'has-error' : ''}`}>
              City / area
              <select value={form.city} onChange={set('city')}>
                {AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {shown.city && <span className="error">{shown.city}</span>}
            </label>
            <label>
              Order notes <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>(optional)</span>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Gate code, don’t ring, extra chilli…"
              />
            </label>

            <div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Payment</p>
              <div className="pay-grid">
                {PAYMENTS.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    className={`pay-card ${payment === opt.id ? 'is-on' : ''}`}
                    aria-pressed={payment === opt.id}
                    onClick={() => setPayment(opt.id)}
                  >
                    <strong>{opt.name}</strong>
                    <span>{opt.hint}</span>
                  </button>
                ))}
              </div>
              <p className="pay-note" style={{ marginTop: 10 }}>
                Cash on Delivery is the working option here. eSewa, Khalti and Fonepay are visual only — we do not process payments yet.
              </p>
            </div>
          </div>

          <aside className="checkout-side cart-side">
            <OrderSummary totals={totals} />
            <div className="eta-card">
              <strong>{totals.count} item{totals.count === 1 ? '' : 's'}</strong>
              <p>
                Packed at New Baneshwor · {form.city || 'your area'} · 45–90 min.
              </p>
            </div>
            <button className="btn" type="submit" disabled={placing}>
              Place order · {formatNPR(totals.total)}
            </button>
            <Link className="btn btn-ghost" to="/cart">Back to bag</Link>
          </aside>
        </form>

        <div className="sticky-checkout">
          <span className="price">{formatNPR(totals.total)}</span>
          <button className="btn" type="button" disabled={placing} onClick={submit}>
            Place order
          </button>
        </div>
      </div>
    </section>
  )
}
