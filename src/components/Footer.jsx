import { Link } from 'react-router-dom'
import { navLinks, storeInfo } from '../data/store'
import { useCatalog } from '../context/CatalogContext'
import Logo from './Logo'
import './Footer.css'

export default function Footer() {
  const { categories } = useCatalog()
  return (
    <footer className="site-footer" id="contact">
      <div className="wrap footer-grid">
        <div className="footer-brand" id="about">
          <Logo />
          <p>
            {storeInfo.tagline} A neighborhood mini mart in New Baneshwor — groceries, produce,
            and household essentials without the warehouse run.
          </p>
          <div className="socials" aria-label="Social links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-1.7 0-3 1.6-3 3.5V12H8v3h3v7h3v-7h3l1-3h-4V9.5c0-.3.2-.5.5-.5Z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M14 4v10.2a3.2 3.2 0 1 1-3.2-3.2V8.2A6 6 0 1 0 17 14V9.4A8 8 0 0 0 20 10V6.8A6.2 6.2 0 0 1 14 4Z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3>Quick links</h3>
          {navLinks.map((link) => (
            <Link key={link.id} to={link.to}>{link.label}</Link>
          ))}
        </div>

        <div>
          <h3>Categories</h3>
          {categories.slice(0, 8).map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`}>{c.name}</Link>
          ))}
        </div>

        <div className="footer-contact">
          <h3>Contact</h3>
          <p>{storeInfo.address}</p>
          <p>
            <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`}>{storeInfo.phone}</a>
          </p>
          <p>
            <a href={`mailto:${storeInfo.email}`}>{storeInfo.email}</a>
          </p>
          <div className="hours">
            <strong>Opening hours</strong>
            {storeInfo.hours.map((h) => (
              <span key={h.days}>{h.days}: {h.time}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Yalamber Mini Mart. All rights reserved.</span>
        <span>Made for the neighborhood · Kathmandu</span>
      </div>
    </footer>
  )
}
