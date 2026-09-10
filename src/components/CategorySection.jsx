import { useCatalog } from '../context/CatalogContext'
import useInView from '../hooks/useInView'
import CategoryCard from './CategoryCard'
import DataState from './DataState'
import './Categories.css'

export default function CategorySection() {
  const [ref, inView] = useInView()
  const { categories, status, error, reload } = useCatalog()

  return (
    <section className="section categories" id="categories" ref={ref}>
      <div className="wrap">
        <div className={`section-head reveal ${inView ? 'is-in' : ''}`}>
          <div>
            <p className="eyebrow">Aisle guide</p>
            <h2>Shop by category</h2>
          </div>
          <p className="lede">Twelve everyday aisles, stocked the way a neighborhood mart should be — close, clear, and easy to grab.</p>
        </div>
        <div className={`cat-grid reveal ${inView ? 'is-in' : ''}`}>
          <DataState
            loading={status === 'loading' && categories.length === 0}
            error={status === 'error' && categories.length === 0 ? error : ''}
            empty={status === 'ready' && categories.length === 0}
            emptyTitle="Aisles are being marked."
            onRetry={reload}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </DataState>
        </div>
      </div>
    </section>
  )
}
