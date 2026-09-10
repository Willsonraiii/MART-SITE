import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminGet } from '../lib/apiClient'
import AdminLayout from './AdminLayout'
import DataState from '../components/DataState'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import InventoryPage from './pages/InventoryPage'
import OffersPage from './pages/OffersPage'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'
import './Admin.css'

function DeskLogin({ title, note, onSigned }) {
  const { login } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
      if (signed?.role !== 'admin') {
        setError('That account is not a shopkeeper.')
        setBusy(false)
        return
      }
      await adminGet('/ping')
      onSigned()
    } catch (err) {
      setError(err.message || 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <section className="admin-forbidden">
      <div style={{ width: 'min(420px, 100%)', textAlign: 'left' }}>
        <p className="eyebrow">Shopkeeper desk</p>
        <h1>{title}</h1>
        <p style={{ color: 'var(--ink-2)', margin: '12px 0 20px' }}>{note}</p>
        <form className="checkout-form" onSubmit={submit}>
          {error && <p className="error">{error}</p>}
          <label>
            Email or phone
            <input
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="admin@yalambermart.com.np"
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
          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Opening desk…' : 'Open the desk'}
          </button>
        </form>
      </div>
    </section>
  )
}

function Forbidden() {
  return (
    <section className="admin-forbidden">
      <div>
        <p className="eyebrow">Shopkeeper only</p>
        <h1>This desk is locked.</h1>
        <p style={{ color: 'var(--ink-2)', margin: '12px 0 20px' }}>
          Sign in with an admin account to manage the racks.
        </p>
      </div>
    </section>
  )
}

export default function AdminApp() {
  const { user, ready, logout } = useAuth()
  const [gate, setGate] = useState('check')

  useEffect(() => {
    if (!ready) return undefined
    if (!user) {
      setGate('login')
      return undefined
    }
    if (user.role !== 'admin') {
      setGate('forbidden')
      return undefined
    }
    let live = true
    setGate('check')
    adminGet('/ping')
      .then(() => {
        if (live) setGate('ok')
      })
      .catch(() => {
        if (live) setGate('login')
      })
    return () => {
      live = false
    }
  }, [ready, user])

  if (!ready || gate === 'check') {
    return (
      <div className="admin-forbidden">
        <DataState loading />
      </div>
    )
  }

  if (gate === 'forbidden') return <Forbidden />

  if (gate === 'login') {
    return (
      <DeskLogin
        title="Sign in to the desk"
        note="Stay on this page — the preview drops cookies, so the desk signs you in here."
        onSigned={() => setGate('ok')}
      />
    )
  }

  return (
    <AdminLayout user={user} onLogout={logout}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  )
}
