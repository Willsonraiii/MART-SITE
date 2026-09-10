import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatNPR } from '../data/store'
import { flyToCart } from '../lib/flyToCart'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

export default function ProductCard({ product, onAdd }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const out = product.stock === 'out'

  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  const onMove = (e) => {
    if (reduced || window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-6px)`
  }

  return (
    <article
      className="product-card"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ perspective: '800px' }}
    >
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-media">
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
          {product.discount > 0 && <span className="badge-sale">{product.discount}% OFF</span>}
        </div>
        <div className="product-body">
          <p className="product-brand">{product.brand}</p>
          <h3>{product.name}</h3>
          <p className="product-weight">{product.weight}</p>
          <div className="product-row">
            <p className="price">
              {product.originalPrice ? <s>{formatNPR(product.originalPrice)}</s> : null}
              {formatNPR(product.price)}
            </p>
            <span className={`stock ${product.stock}`}>{product.stockLabel}</span>
          </div>
        </div>
      </Link>
      <div className="product-action">
        <button
          className="btn"
          type="button"
          disabled={out}
          onClick={() => {
            flyToCart(ref.current)
            onAdd(product)
          }}
        >
          {out ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
