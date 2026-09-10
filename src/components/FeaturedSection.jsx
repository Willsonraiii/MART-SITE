import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import useInView from '../hooks/useInView'
import DataState from './DataState'
import ProductGrid from './ProductGrid'
import './Products.css'

export default function FeaturedSection({ onAdd }) {
  const [ref, inView] = useInView()
  const { featured, status, error, reload } = useCatalog()

  return (
    <section className="section products" id="featured" ref={ref}>
      <div className="wrap">
        <div className={`section-head reveal ${inView ? 'is-in' : ''}`}>
          <div>
            <p className="eyebrow">From the shelves</p>
            <h2>Featured products</h2>
          </div>
          <p className="lede">
            The bags that walk out most days — noodles, milk, oil, and a cold cola for the walk home.{' '}
            <Link to="/shop" style={{ color: 'var(--leaf)', fontWeight: 600 }}>Browse all →</Link>
          </p>
        </div>
        <div className={`reveal ${inView ? 'is-in' : ''}`}>
          <DataState
            loading={status === 'loading' && featured.length === 0}
            error={status === 'error' && featured.length === 0 ? error : ''}
            empty={status === 'ready' && featured.length === 0}
            emptyTitle="No featured bags today."
            emptyText="Browse the shop while we restock the front table."
            onRetry={reload}
          >
            <ProductGrid products={featured} onAdd={onAdd} />
          </DataState>
        </div>
      </div>
    </section>
  )
}
