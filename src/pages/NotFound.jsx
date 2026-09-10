import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <section className="pdp-missing wrap">
      <Seo title="Page not found — Yalamber Mini Mart" description="This aisle is empty. Head back to the shop." path="/404" />
      <p className="eyebrow">Wrong aisle</p>
      <h1>This page isn’t on the rack.</h1>
      <p style={{ margin: '12px 0 20px', color: 'var(--ink-2)' }}>
        Head back to the shop — the noodles are still there.
      </p>
      <Link className="btn" to="/shop">Go to shop</Link>
    </section>
  )
}
