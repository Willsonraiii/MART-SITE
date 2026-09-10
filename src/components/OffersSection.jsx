import { useCatalog } from '../context/CatalogContext'
import useInView from '../hooks/useInView'
import DataState from './DataState'
import OfferCard from './OfferCard'
import './Offers.css'

export default function OffersSection() {
  const [ref, inView] = useInView()
  const { offers, status, error, reload } = useCatalog()

  return (
    <section className="section offers" id="offers" ref={ref}>
      <div className="wrap">
        <div className={`section-head reveal ${inView ? 'is-in' : ''}`}>
          <div>
            <p className="eyebrow">Today’s deals</p>
            <h2>Worth walking over for</h2>
          </div>
          <p className="lede">A short list. Real discounts. No tiny asterisks hiding in the oil aisle.</p>
        </div>
        <div className={`offer-grid reveal ${inView ? 'is-in' : ''}`}>
          <DataState
            loading={status === 'loading' && offers.length === 0}
            error={status === 'error' && offers.length === 0 ? error : ''}
            empty={status === 'ready' && offers.length === 0}
            emptyTitle="No deals on the board."
            onRetry={reload}
          >
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </DataState>
        </div>
      </div>
    </section>
  )
}
