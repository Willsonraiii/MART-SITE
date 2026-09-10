import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import EmptyCart from '../components/EmptyCart'
import OrderSummary from '../components/OrderSummary'
import { useCart } from '../context/CartContext'
import { formatNPR } from '../data/store'
import { stockMax } from '../lib/cart'
import './CartPage.css'

export default function CartPage() {
  const { cart, totals, setQty, remove } = useCart()
  const navigate = useNavigate()

  return (
    <section className="cart-page">
      <Seo title="Cart — Yalamber Mini Mart" description="Review your bag before checkout at Yalamber Mini Mart." path="/cart" />
      <div className="wrap">
        <p className="eyebrow">Your bag</p>
        <h1>Cart</h1>
        <p style={{ color: 'var(--ink-2)' }}>Check quantities, then we’ll pack it for New Baneshwor.</p>

        {cart.length === 0 ? (
          <div style={{ marginTop: 28 }}>
            <EmptyCart />
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cart.map((item) => {
                const max = stockMax(item)
                return (
                  <article className="cart-item" key={item.id}>
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div>
                      <h3>
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <p className="meta">
                        {item.brand} · {item.weight} · {formatNPR(item.price)}
                        {item.discount > 0 ? ` · ${item.discount}% off` : ''}
                      </p>
                      <div className="qty">
                        <button type="button" aria-label="Decrease" onClick={() => setQty(item.id, item.qty - 1)}>–</button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          disabled={item.qty >= max}
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                        <button type="button" className="qty-remove" onClick={() => remove(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="line-price price">{formatNPR(item.subtotal)}</div>
                  </article>
                )
              })}
            </div>

            <aside className="cart-side">
              <OrderSummary totals={totals} />
              <div className="eta-card">
                <strong>Delivery estimate</strong>
                <p>Same-day in Kathmandu · typically 45–90 minutes from New Baneshwor.</p>
              </div>
              <Link className="btn btn-ghost" to="/shop">Continue Shopping</Link>
              <button className="btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </aside>

            <div className="sticky-checkout">
              <span className="price">{formatNPR(totals.total)}</span>
              <button className="btn" type="button" onClick={() => navigate('/checkout')}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
