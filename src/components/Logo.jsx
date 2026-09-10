import { Link } from 'react-router-dom'

export default function Logo({ onClick }) {
  return (
    <Link to="/" className="logo" aria-label="Yalamber Mini Mart home" onClick={onClick}>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="14" fill="currentColor" />
          <path
            d="M13.5 20h21l-1.65 16.4A3 3 0 0 1 29.9 39H18.1a3 3 0 0 1-2.95-2.6L13.5 20Z"
            fill="#F4EFE6"
          />
          <path
            d="M18 20c0-3.6 2.7-6.6 6-6.6s6 3 6 6.6"
            stroke="#F4EFE6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M24.8 27.4c2.2-.9 4.4.3 5 2.4-2.3.7-4.5-.5-5-2.4Z"
            fill="#3D8A58"
          />
        </svg>
      </span>
      <span className="logo-text">
        <span className="logo-name">Yalamber</span>
        <span className="logo-sub">Mini Mart</span>
      </span>
    </Link>
  )
}
