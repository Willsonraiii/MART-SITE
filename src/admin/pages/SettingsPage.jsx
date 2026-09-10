import { useEffect, useState } from 'react'
import { adminGet, adminSend } from '../../lib/apiClient'
import DataState from '../../components/DataState'

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminGet('/settings')
      .then(setForm)
      .catch((err) => setError(err.message))
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setSaved('')
    setError('')
    try {
      const next = await adminSend('/settings', 'PATCH', {
        ...form,
        deliveryFee: Number(form.deliveryFee),
        freeDeliveryOver: Number(form.freeDeliveryOver),
      })
      setForm(next)
      setSaved('Settings saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!form && !error) return <DataState loading />
  if (error && !form) return <DataState error={error} />

  return (
    <form className="admin-card admin-form" onSubmit={save}>
      <h2>Settings</h2>
      {error && <p className="admin-banner">{error}</p>}
      {saved && <p style={{ color: 'var(--leaf)', fontWeight: 600 }}>{saved}</p>}
      <div className="admin-form-grid">
        <label className="admin-field">Store name<input value={form.storeName} onChange={set('storeName')} /></label>
        <label className="admin-field">Tagline<input value={form.tagline} onChange={set('tagline')} /></label>
        <label className="admin-field">Phone<input value={form.phone} onChange={set('phone')} /></label>
        <label className="admin-field">Email<input value={form.email} onChange={set('email')} /></label>
      </div>
      <label className="admin-field">Address<textarea value={form.address} onChange={set('address')} /></label>
      <div className="admin-form-grid">
        <label className="admin-field">Hours (Sun–Fri)<input value={form.hoursWeekday} onChange={set('hoursWeekday')} /></label>
        <label className="admin-field">Hours (Saturday)<input value={form.hoursSaturday} onChange={set('hoursSaturday')} /></label>
        <label className="admin-field">Delivery fee (Rs.)<input type="number" min="0" value={form.deliveryFee} onChange={set('deliveryFee')} /></label>
        <label className="admin-field">Free delivery over (Rs.)<input type="number" min="0" value={form.freeDeliveryOver} onChange={set('freeDeliveryOver')} /></label>
      </div>
      <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>
        Delivery fee changes apply to new checkouts. The shopfront copy stays the neighborhood design.
      </p>
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  )
}
