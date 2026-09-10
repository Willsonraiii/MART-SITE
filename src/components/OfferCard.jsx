import { Link } from 'react-router-dom'

export default function OfferCard({ offer }) {
  return (
    <article className={`offer-card ${offer.theme}`}>
      <p className="kicker">{offer.kicker}</p>
      <h3>{offer.title}</h3>
      <span className="offer-tag">{offer.tag}</span>
      <p>{offer.detail}</p>
      <Link className="btn" to={offer.to}>
        {offer.cta}
      </Link>
      <span className="offer-punch" aria-hidden="true" />
    </article>
  )
}
