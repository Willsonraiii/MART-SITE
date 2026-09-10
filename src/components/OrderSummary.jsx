import { formatNPR } from '../data/store'
import { FREE_DELIVERY_OVER } from '../lib/cart'

export default function OrderSummary({ totals, compact = false }) {
  return (
    <div className={`order-summary ${compact ? 'is-compact' : ''}`}>
      <h3>Order summary</h3>
      <p>
        <span>Subtotal</span>
        <span>{formatNPR(totals.subtotal)}</span>
      </p>
      <p>
        <span>Discount</span>
        <span className={totals.discount ? 'save' : ''}>
          {totals.discount ? `− ${formatNPR(totals.discount)}` : 'Rs. 0'}
        </span>
      </p>
      <p>
        <span>Delivery fee</span>
        <span>{totals.delivery ? formatNPR(totals.delivery) : 'Free'}</span>
      </p>
      {!totals.freeDelivery && totals.count > 0 && (
        <p className="summary-hint">
          Add {formatNPR(totals.remainingForFree)} more for free delivery (over {formatNPR(FREE_DELIVERY_OVER)}).
        </p>
      )}
      {totals.freeDelivery && (
        <p className="summary-hint save">Free delivery unlocked.</p>
      )}
      <p className="summary-total">
        <span>Grand total</span>
        <strong className="price">{formatNPR(totals.total)}</strong>
      </p>
    </div>
  )
}
