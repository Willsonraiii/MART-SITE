import { PRICE_BOUNDS } from '../data/catalog'
import { categories as defaultCategories, formatNPR } from '../data/store'

const PRESETS = [
  { id: 'any', label: 'Any price', min: '', max: '' },
  { id: 'u50', label: 'Under Rs. 50', min: '', max: '50' },
  { id: '50-150', label: 'Rs. 50–150', min: '50', max: '150' },
  { id: '150-300', label: 'Rs. 150–300', min: '150', max: '300' },
  { id: '300p', label: 'Over Rs. 300', min: '300', max: '' },
]

export default function ShopFilters({
  value,
  onChange,
  namePrefix = 'filter',
  categoryList = defaultCategories,
  priceBounds = PRICE_BOUNDS,
}) {
  const set = (patch) => onChange({ ...value, ...patch, page: 1 })

  const presetId = PRESETS.find(
    (p) => String(p.min) === String(value.minPrice ?? '') && String(p.max) === String(value.maxPrice ?? ''),
  )?.id

  return (
    <div className="shop-filters">
      <section>
        <h3>Category</h3>
        <label className="filter-row">
          <input
            type="radio"
            name={`${namePrefix}-cat`}
            checked={!value.category}
            onChange={() => set({ category: '' })}
          />
          All aisles
        </label>
        {categoryList.map((c) => (
          <label className="filter-row" key={c.id}>
            <input
              type="radio"
              name={`${namePrefix}-cat`}
              checked={value.category === c.id}
              onChange={() => set({ category: c.id })}
            />
            <span>{c.name}</span>
            <small>{c.count}</small>
          </label>
        ))}
      </section>

      <section>
        <h3>Price</h3>
        <div className="price-presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={presetId === p.id ? 'is-on' : ''}
              onClick={() => set({ minPrice: p.min, maxPrice: p.max })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="price-inputs">
          <label>
            Min
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              placeholder={String(priceBounds.min)}
              value={value.minPrice}
              onChange={(e) => set({ minPrice: e.target.value })}
            />
          </label>
          <label>
            Max
            <input
              type="number"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              placeholder={String(PRICE_BOUNDS.max)}
              value={value.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
            />
          </label>
        </div>
        <p className="filter-note">
          Shelf range {formatNPR(priceBounds.min)} – {formatNPR(priceBounds.max)}
        </p>
      </section>

      <section>
        <h3>Availability</h3>
        {[
          { id: 'all', label: 'All items' },
          { id: 'available', label: 'In stock' },
          { id: 'low', label: 'Low stock' },
        ].map((opt) => (
          <label className="filter-row" key={opt.id}>
            <input
              type="radio"
              name={`${namePrefix}-stock`}
              checked={value.availability === opt.id}
              onChange={() => set({ availability: opt.id })}
            />
            {opt.label}
          </label>
        ))}
      </section>

      <section>
        <h3>Offers</h3>
        <label className="filter-row">
          <input
            type="checkbox"
            checked={value.discounted}
            onChange={(e) => set({ discounted: e.target.checked })}
          />
          Discounted products
        </label>
      </section>
    </div>
  )
}
