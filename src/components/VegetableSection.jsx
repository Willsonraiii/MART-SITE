import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { formatNPR } from '../data/store'
import { flyToCart } from '../lib/flyToCart'
import useInView from '../hooks/useInView'
import DataState from './DataState'
import './Vegetables.css'

export default function VegetableSection({ onAdd }) {
  const [ref, inView] = useInView()
  const { vegetables, status, error, reload } = useCatalog()

  return (
    <section className="section veg" id="vegetables" ref={ref}>
      <div className="wrap">
        <div className={`section-head reveal ${inView ? 'is-in' : ''}`}>
          <div>
            <p className="eyebrow">From the mandi</p>
            <h2>Fresh vegetables</h2>
          </div>
          <p className="lede">
            In before the shutters lift. Local farm lots, weighed at the counter, priced by the kilo.{' '}
            <Link to="/shop?category=vegetables" style={{ color: 'var(--gold-soft)', fontWeight: 600 }}>
              Shop produce →
            </Link>
          </p>
        </div>
        <div className={`veg-grid reveal ${inView ? 'is-in' : ''}`}>
          <DataState
            loading={status === 'loading' && vegetables.length === 0}
            error={status === 'error' && vegetables.length === 0 ? error : ''}
            empty={status === 'ready' && vegetables.length === 0}
            emptyTitle="The mandi crate is empty."
            emptyText="Produce is coming in — check the shop in a bit."
            onRetry={reload}
          >
            {vegetables.map((item) => (
              <article className="veg-card" key={item.id}>
                <Link to={`/product/${item.id}`} className="veg-media">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                  {item.discount > 0 && <span className="badge-sale">{item.discount}% OFF</span>}
                </Link>
                <div className="veg-body">
                  <h3>
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="veg-note">{item.note} · {item.unit || item.weight}</p>
                  <div className="product-row">
                    <p className="price">
                      {item.originalPrice ? <s>{formatNPR(item.originalPrice)}</s> : null}
                      {formatNPR(item.price)}
                    </p>
                    <span className={`stock ${item.stock}`}>{item.stockLabel}</span>
                  </div>
                  <button
                    className="btn"
                    type="button"
                    onClick={(e) => {
                      flyToCart(e.currentTarget.closest('.veg-card'))
                      onAdd(item)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </DataState>
        </div>
      </div>
    </section>
  )
}
