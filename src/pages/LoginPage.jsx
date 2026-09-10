import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'
import './CartPage.css'

function destFor(user, from) {
  if (from && from !== '/login' && from !== '/register') return from
  if (user?.role === 'admin') return '/admin'
  return '/account'
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = location.state?.from

  if (user) return <Navigate to={destFor(user, from)} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!loginId.trim() || !password) {
      setError('Enter your email or phone, and password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const signed = await login({ email: loginId.trim(), password })
      navigate(destFor(signed, from), { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <section className="checkout-page">
      <Seo title="Sign in — Yalamber Mini Mart" description="Sign in to keep orders on your account." path="/login" />
      <div className="wrap" style={{ maxWidth: 520 }}>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: 20 }}>
          Your orders stay on this account. Guest bags still work without signing in.
          Shopkeepers are taken to the store desk after sign-in.
        </p>
        <form className="checkout-form" onSubmit={submit}>
          {error && <p className="error">{error}</p>}
          <label>
            Email or phone
            <input
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="you@email.com or 98XXXXXXXX"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="pay-note">
            New here? <Link to="/register" style={{ color: 'var(--leaf)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
