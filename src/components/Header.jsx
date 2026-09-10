import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { navLinks, storeInfo } from '../data/store'
import { useAuth } from '../context/AuthContext'
import { IconCart, IconClose, IconMenu, IconSearch, IconUser } from './Icons'
import './Header.css'

export default function Header({ cartCount, onSearch, onCart, menuOpen, setMenuOpen }) {
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    document.body.classList.toggle('nav-lock', menuOpen)
    return () => document.body.classList.remove('nav-lock')
  }, [menuOpen])

  const isHome = location.pathname === '/'
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
    <header className={`site-header ${isHome ? 'is-home' : ''}`}>
      {!isHome && (
      <div className="announce" role="note">
        <div className="announce-inner">
          <span>Fresh stock in daily · New Baneshwor</span>
          <span>Open today 7:00 AM – 9:00 PM</span>
          <span>Free pickup · Delivery over Rs. 1,000</span>
        </div>
      </div>
      )}

      <div className="wrap header-bar">
        <Logo onClick={closeMenu} />

        <nav className="desktop-nav" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.to}
              end={link.id === 'home'}
              className={({ isActive }) => {
                if (link.id === 'shop' && (location.pathname.startsWith('/product') || location.pathname.startsWith('/cart') || location.pathname.startsWith('/checkout') || location.pathname.startsWith('/order'))) return 'active'
                return isActive && !link.to.includes('#') ? 'active' : undefined
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user?.role === 'admin' && (
            <NavLink className="desk-link" to="/admin" onClick={closeMenu}>
              Desk
            </NavLink>
          )}
          <button className="icon-btn" type="button" aria-label="Search products" onClick={onSearch}>
            <IconSearch />
          </button>
          <NavLink
            className={({ isActive }) =>
              `icon-btn${isActive || location.pathname.startsWith('/admin') || location.pathname === '/register' || location.pathname === '/account' ? ' active' : ''}`
            }
            to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}
            aria-label={user?.role === 'admin' ? 'Shopkeeper desk' : user ? 'Your account' : 'Sign in'}
            onClick={closeMenu}
          >
            <IconUser />
          </NavLink>
          {!user && (
            <NavLink className="signup-link" to="/register" onClick={closeMenu}>
              Sign Up
            </NavLink>
          )}
          <button
            className="icon-btn"
            data-cart-btn
            aria-label={`Cart, ${cartCount} items`}
            onClick={onCart}
          >
            <IconCart />
            {cartCount > 0 && <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>
          <button
            className="icon-btn menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>

      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-nav-top">
          <Logo onClick={closeMenu} />
          <button className="icon-btn" aria-label="Close menu" onClick={closeMenu}>
            <IconClose />
          </button>
        </div>
        <nav aria-label="Mobile">
          {navLinks.map((link) => (
            <NavLink key={link.id} to={link.to} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} onClick={closeMenu}>
            {user?.role === 'admin' ? 'Shopkeeper desk' : user ? 'Account' : 'Sign in'}
          </NavLink>
          {!user && (
            <NavLink to="/register" onClick={closeMenu}>Sign up</NavLink>
          )}
        </nav>
        <p className="mobile-nav-foot">{storeInfo.tagline} · {storeInfo.address}</p>
      </div>
    </>
  )
}
