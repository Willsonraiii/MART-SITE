import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'
import './CartPage.css'

const empty = {
  name: '',
  email: '',
  phone: '',
  password: '',
  address: '',
}

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [details, setDetails] = useState({})
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/account" replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDetails({})
    try {
      await register(form)
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create the account.')
      setDetails(err.payload?.error?.details || {})
      setBusy(false)
    }
  }

  return (
    <section className="checkout-page">
      <Seo title="Create account — Yalamber Mini Mart" description="Save your address and look up past orders." path="/register" />
      <div className="wrap" style={{ maxWidth: 560 }}>
        <p className="eyebrow">Join the neighborhood</p>
        <h1>Create account</h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: 20 }}>
          Save your address and look up past orders. We never show your password.
        </p>
        <form className="checkout-form" onSubmit={submit}>
          {error && <p className="error">{error}</p>}
          <label className={`field ${details.name ? 'has-error' : ''}`}>
            Full name
            <input autoComplete="name" value={form.name} onChange={set('name')} placeholder="Sita Sharma" />
            {details.name && <span className="error">{details.name}</span>}
          </label>
          <label className={`field ${details.email ? 'has-error' : ''}`}>
            Email
            <input autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
            {details.email && <span className="error">{details.email}</span>}
          </label>
          <label className={`field ${details.phone ? 'has-error' : ''}`}>
            Phone
            <input autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="98XXXXXXXX" />
            {details.phone && <span className="error">{details.phone}</span>}
          </label>
          <label className={`field ${details.password ? 'has-error' : ''}`}>
            Password
            <input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
            {details.password && <span className="error">{details.password}</span>}
          </label>
          <label>
            Address <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>(optional)</span>
            <input autoComplete="street-address" value={form.address} onChange={set('address')} />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Create account'}
          </button>
          <p className="pay-note">
            Already have one? <Link to="/login" style={{ color: 'var(--leaf)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
