import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { IconClose, IconMenu } from '../components/Icons'
import { NAV } from './adminMeta'
import './Admin.css'

export default function AdminLayout({ user, onLogout, children }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('nav-lock', open)
    return () => document.body.classList.remove('nav-lock')
  }, [open])

  useEffect(() => {
    const prev = document.title
    document.title = 'Store desk — Yalamber Mini Mart'
    return () => {
      document.title = prev
    }
  }, [])

  const close = () => setOpen(false)

  return (
    <div className="admin-shell">
      {open && (
        <button className="admin-scrim" type="button" aria-label="Close menu" onClick={close} />
      )}
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-brand">
          <div>
            <strong>Yalamber</strong>
            <small>Shopkeeper desk</small>
          </div>
          <button className="icon-btn admin-side-close" type="button" aria-label="Close menu" onClick={close}>
            <IconClose />
          </button>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink key={item.id} to={item.to} end={item.end} onClick={close}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link className="btn btn-cream" to="/" onClick={close}>View shop</Link>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onLogout}
            style={{ color: 'var(--cream)', borderColor: 'rgba(244,239,230,0.3)' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <div>
            <p className="eyebrow">New Baneshwor</p>
            <h1>Store desk</h1>
          </div>
          <div className="admin-top-actions">
            <Link className="btn btn-ghost admin-shop-link" to="/">View shop</Link>
            <span className="admin-who">{user?.name}</span>
            <button
              className="icon-btn admin-menu"
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
