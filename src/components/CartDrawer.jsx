import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatNPR } from '../data/store'
import { stockMax } from '../lib/cart'
import { useCart } from '../context/CartContext'
import { IconClose } from './Icons'
import EmptyCart from './EmptyCart'
import OrderSummary from './OrderSummary'
import './Overlays.css'
import './CartExtras.css'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, remove, totals } = useCart()
  const navigate = useNavigate()
  const onClose = () => setCartOpen(false)

  useEffect(() => {
    document.body.classList.toggle('overlay-lock', cartOpen)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (cartOpen) window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('overlay-lock')
      window.removeEventListener('keydown', onKey)
    }
  }, [cartOpen])

  if (!cartOpen) return null

  return (
    <>
      <button className="overlay-scrim" aria-label="Close cart" onClick={onClose} />
      <aside className="drawer cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>Your bag · {totals.count}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart">
            <IconClose />
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 && <EmptyCart compact />}
          {cart.map((item) => {
            const max = stockMax(item)
            return (
              <article className="cart-line" key={item.id}>
                <Link to={`/product/${item.id}`} onClick={onClose}>
                  <img src={item.image} alt="" />
                </Link>
                <div>
                  <strong>
                    <Link to={`/product/${item.id}`} onClick={onClose}>{item.name}</Link>
                  </strong>
                  <small>
                    {item.brand} · {item.weight} · {formatNPR(item.price)}
                    {item.discount > 0 ? ` · ${item.discount}% off` : ''}
                  </small>
                  <div className="qty">
                    <button aria-label="Decrease" onClick={() => setQty(item.id, item.qty - 1)}>–</button>
                    <span>{item.qty}</span>
                    <button
                      aria-label="Increase"
                      disabled={item.qty >= max}
                      onClick={() => setQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                    <button className="qty-remove" aria-label="Remove" onClick={() => remove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <span className="price">{formatNPR(item.subtotal)}</span>
              </article>
            )
          })}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot drawer-foot-stack">
            <OrderSummary totals={totals} compact />
            <div className="drawer-actions">
              <Link className="btn btn-ghost" to="/cart" onClick={onClose}>
                View bag
              </Link>
              <button
                className="btn"
                onClick={() => {
                  onClose()
                  navigate('/checkout')
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
