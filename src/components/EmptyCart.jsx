import { Link } from 'react-router-dom'

export default function EmptyCart({ compact = false }) {
  return (
    <div className={`empty-cart ${compact ? 'is-compact' : ''}`}>
      <svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true">
        <rect width="88" height="88" rx="28" fill="#E5F3EA" />
        <path
          d="M28 36h32l-3 28.4A5 5 0 0 1 52.1 69H35.9a5 5 0 0 1-4.95-4.6L28 36Z"
          fill="#143528"
        />
        <path d="M34 36c0-6 4.2-11 10-11s10 5 10 11" stroke="#143528" strokeWidth="3.2" fill="none" />
        <path d="M44 48c4-1.6 8 .6 9.2 4.2" stroke="#3D8A58" strokeWidth="2.4" fill="none" />
      </svg>
      <h2>{compact ? 'Your bag is empty' : 'Nothing in the bag yet'}</h2>
      <p>The noodles are waiting. Fill it from the aisles — Wai Wai, milk, a cold cola.</p>
      <Link className="btn" to="/shop">Continue Shopping</Link>
    </div>
  )
}
