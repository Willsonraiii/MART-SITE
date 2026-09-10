import { lazy, Suspense, useEffect, useState } from 'react'
import Seo from '../components/Seo'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DataState from '../components/DataState'
import ProductGrid from '../components/ProductGrid'
import QtySelector from '../components/QtySelector'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { stockMax } from '../lib/cart'
import { fetchProduct } from '../lib/apiClient'
import { flyToCart } from '../lib/flyToCart'
import { formatNPR } from '../data/store'
import '../components/Products.css'
import './ProductPage.css'

const ProductViewer3D = lazy(() => import('../components/ProductViewer3D'))

export default function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { categories } = useCatalog()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [view3d, setView3d] = useState(false)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [missing, setMissing] = useState(false)

  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError('')
    setMissing(false)
    setProduct(null)
    setQty(1)
    setView3d(false)
    fetchProduct(id, { signal: ac.signal })
      .then((data) => {
        const { related: relatedItems, ...item } = data
        setProduct(item)
        setRelated(relatedItems || [])
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        if (err.status === 404) {
          setMissing(true)
          setLoading(false)
          return
        }
        setError(err.message || 'Could not load this product.')
        setLoading(false)
      })
    return () => ac.abort()
  }, [id, retry])

  if (loading || error) {
    return (
      <section className="pdp">
        <div className="wrap" style={{ padding: '48px 0' }}>
          <DataState loading={loading} error={error} onRetry={() => setRetry((n) => n + 1)} />
        </div>
      </section>
    )
  }

  if (missing || !product) {
    return (
      <section className="pdp-missing wrap">
        <p className="eyebrow">Missing from the rack</p>
        <h1>We couldn’t find that product.</h1>
        <p style={{ margin: '12px 0 20px', color: 'var(--ink-2)' }}>It may have moved aisles.</p>
        <Link className="btn" to="/shop">Back to shop</Link>
      </section>
    )
  }

  const cat = categories.find((c) => c.id === product.category)
  const out = product.stock === 'out'
  const can3d = Boolean(product.model)

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description || product.name,
    brand: { '@type': 'Brand', name: product.brand || 'Yalamber' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: product.price,
      availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  }

  return (
    <section className="pdp">
      <Seo
        title={`${product.name} — Yalamber Mini Mart`}
        description={product.description || `Buy ${product.name} at Yalamber Mini Mart, New Baneshwor.`}
        path={`/product/${product.id}`}
        image={product.image}
        type="product"
        jsonLd={productLd}
      />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`}>{cat?.name || product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="pdp-media">
            {view3d && can3d ? (
              <div className="pdp-3d">
                <Suspense fallback={<img src={product.image} alt={product.name} />}>
                  <ProductViewer3D model={product.model} color={product.modelColor} />
                </Suspense>
              </div>
            ) : (
              <img src={product.image} alt={product.name} />
            )}
            {product.discount > 0 && <span className="badge-sale">{product.discount}% OFF</span>}
            {can3d && (
              <div className="pdp-view-toggle">
                <button className="btn btn-cream" type="button" onClick={() => setView3d((v) => !v)}>
                  {view3d ? 'View photo' : 'View in 3D'}
                </button>
              </div>
            )}
          </div>

          <div className="pdp-copy">
            <p className="product-brand">{product.brand}</p>
            <h1>{product.name}</h1>
            <div className="pdp-price price">
              {product.originalPrice ? <s>{formatNPR(product.originalPrice)}</s> : null}
              {formatNPR(product.price)}
            </div>
            <div className="pdp-meta">
              <span>{product.unit || product.weight}</span>
              <span className={`stock ${product.stock}`}>{product.stockLabel}</span>
              {cat && <Link to={`/shop?category=${cat.id}`}>{cat.name}</Link>}
            </div>
            <p className="pdp-desc">{product.description}</p>
            {product.note && <p className="veg-note">{product.note}</p>}

            <div className="pdp-actions">
              <QtySelector value={qty} onChange={setQty} max={Math.max(1, stockMax(product))} />
              <button
                className="btn"
                type="button"
                disabled={out}
                onClick={(e) => {
                  flyToCart(e.currentTarget.closest('.pdp-grid'))
                  addToCart(product, qty)
                }}
              >
                {out ? 'Out of stock' : 'Add to Cart'}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={out}
                onClick={() => {
                  flushSync(() => addToCart(product, qty))
                  navigate('/checkout')
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="pdp-related">
            <div className="section-head">
              <div>
                <p className="eyebrow">Same aisle</p>
                <h2>Related products</h2>
              </div>
            </div>
            <ProductGrid products={related} onAdd={addToCart} />
          </div>
        )}
      </div>
    </section>
  )
}
