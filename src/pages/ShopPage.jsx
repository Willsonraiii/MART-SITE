import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import ShopFilters from '../components/ShopFilters'
import Pagination from '../components/Pagination'
import DataState from '../components/DataState'
import { IconClose, IconFilter } from '../components/Icons'
import '../components/Overlays.css'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { SORTS } from '../data/catalog'
import { formatNPR } from '../data/store'
import { fetchProducts } from '../lib/apiClient'
import useMediaQuery from '../hooks/useMediaQuery'
import Seo from '../components/Seo'
import './ShopPage.css'

function readParams(sp) {
  return {
    q: sp.get('q') || '',
    category: sp.get('category') || '',
    sort: sp.get('sort') || 'popular',
    minPrice: sp.get('min') || '',
    maxPrice: sp.get('max') || '',
    availability: sp.get('stock') || 'all',
    discounted: sp.get('discounted') === '1',
    page: Number(sp.get('page') || 1),
  }
}

const emptyResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  pageCount: 1,
}

export default function ShopPage() {
  const { addToCart } = useCart()
  const { categories, priceBounds } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [result, setResult] = useState(emptyResult)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)
  const mobile = useMediaQuery('(max-width: 960px)')
  const filters = readParams(params)

  useEffect(() => {
    document.body.classList.toggle('overlay-lock', filterOpen)
    return () => document.body.classList.remove('overlay-lock')
  }, [filterOpen])

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError('')
    fetchProducts(
      {
        q: filters.q,
        category: filters.category,
        sort: filters.sort,
        min: filters.minPrice,
        max: filters.maxPrice,
        stock: filters.availability,
        discounted: filters.discounted ? 1 : '',
        page: filters.page,
      },
      { signal: ac.signal },
    )
      .then((data) => {
        setResult(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message || 'Could not load products.')
        setResult(emptyResult)
        setLoading(false)
      })
    return () => ac.abort()
  }, [
    filters.q,
    filters.category,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.availability,
    filters.discounted,
    filters.page,
    reloadTick,
  ])

  useEffect(() => {
    if (filters.q.trim().length < 2) {
      setSuggestions([])
      return
    }
    const ac = new AbortController()
    const t = window.setTimeout(() => {
      fetchProducts({ q: filters.q, pageSize: 5 }, { signal: ac.signal })
        .then((data) => setSuggestions(data.items || []))
        .catch(() => setSuggestions([]))
    }, 180)
    return () => {
      ac.abort()
      window.clearTimeout(t)
    }
  }, [filters.q])

  const write = (next) => {
    const merged = { ...filters, ...next }
    const sp = new URLSearchParams()
    if (merged.q) sp.set('q', merged.q)
    if (merged.category) sp.set('category', merged.category)
    if (merged.sort && merged.sort !== 'popular') sp.set('sort', merged.sort)
    if (merged.minPrice !== '' && merged.minPrice != null) sp.set('min', String(merged.minPrice))
    if (merged.maxPrice !== '' && merged.maxPrice != null) sp.set('max', String(merged.maxPrice))
    if (merged.availability && merged.availability !== 'all') sp.set('stock', merged.availability)
    if (merged.discounted) sp.set('discounted', '1')
    if (merged.page && merged.page > 1) sp.set('page', String(merged.page))
    setParams(sp, { replace: true })
  }

  const catName = categories.find((c) => c.id === filters.category)?.name
  const chips = []
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, clear: { q: '', page: 1 } })
  if (filters.category) chips.push({ key: 'cat', label: catName, clear: { category: '', page: 1 } })
  if (filters.discounted) chips.push({ key: 'off', label: 'On offer', clear: { discounted: false, page: 1 } })
  if (filters.availability !== 'all') {
    chips.push({
      key: 'st',
      label: filters.availability === 'low' ? 'Low stock' : 'In stock',
      clear: { availability: 'all', page: 1 },
    })
  }
  if (filters.minPrice || filters.maxPrice) {
    const a = filters.minPrice ? formatNPR(filters.minPrice) : 'Any'
    const b = filters.maxPrice ? formatNPR(filters.maxPrice) : 'Any'
    chips.push({ key: 'pr', label: `${a} – ${b}`, clear: { minPrice: '', maxPrice: '', page: 1 } })
  }

  const start = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1
  const end = Math.min(result.total, result.page * result.pageSize)

  return (
    <section className="shop-page">
      <Seo
        title={catName ? `${catName} — Yalamber Mini Mart` : 'Shop groceries — Yalamber Mini Mart'}
        description="Search, filter and sort the racks at Yalamber Mini Mart in New Baneshwor."
        path="/shop"
      />
      <div className="wrap">
        <div className="shop-hero">
          <div>
            <p className="eyebrow">The aisles</p>
            <h1>{catName || 'Shop everything'}</h1>
            <p>Search, filter and sort the racks — no reload, no warehouse wait.</p>
          </div>
        </div>

        <div className="shop-tools">
          <div className="shop-search">
            <input
              value={filters.q}
              placeholder="Search name, brand, aisle…"
              aria-label="Search products"
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
              onChange={(e) => write({ q: e.target.value, page: 1 })}
            />
            {filters.q && (
              <button className="search-clear" onClick={() => write({ q: '', page: 1 })}>
                Clear
              </button>
            )}
            {suggestOpen && suggestions.length > 0 && (
              <div className="suggest-list" role="listbox">
                {suggestions.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`}>
                    <img src={item.image} alt="" />
                    <span>
                      <strong>{item.name}</strong>
                      <br />
                      <small>{item.brand}</small>
                    </span>
                    <span className="price">{formatNPR(item.price)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button className="filter-toggle" type="button" onClick={() => setFilterOpen(true)}>
            <IconFilter /> Filters
          </button>
          <select
            aria-label="Sort products"
            value={filters.sort}
            onChange={(e) => write({ sort: e.target.value, page: 1 })}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="cat-chips" role="tablist" aria-label="Categories">
          <button type="button" className={!filters.category ? 'is-on' : ''} onClick={() => write({ category: '', page: 1 })}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={filters.category === c.id ? 'is-on' : ''}
              onClick={() => write({ category: c.id, page: 1 })}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="shop-layout">
          <aside className="filters-desktop">
            <ShopFilters
              value={filters}
              onChange={write}
              namePrefix="desk"
              categoryList={categories}
              priceBounds={priceBounds}
            />
          </aside>

          <div>
            <div className="shop-results-head">
              <span>
                {loading ? 'Loading…' : result.total === 0 ? 'No products' : `Showing ${start}–${end} of ${result.total}`}
              </span>
              {chips.length > 0 && (
                <button type="button" className="btn-ghost" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--leaf)', fontWeight: 600 }} onClick={() => setParams({}, { replace: true })}>
                  Reset
                </button>
              )}
            </div>

            {chips.length > 0 && (
              <div className="active-chips">
                {chips.map((c) => (
                  <button key={c.key} type="button" onClick={() => write(c.clear)}>
                    {c.label} ×
                  </button>
                ))}
              </div>
            )}

            {loading || error ? (
              <DataState loading={loading} error={error} onRetry={() => setReloadTick((n) => n + 1)} />
            ) : result.total === 0 ? (
              <div className="shop-empty">
                <p className="eyebrow">Empty aisle</p>
                <h2>Nothing matches that mix.</h2>
                <p>Clear a filter or try another word — “wai”, “milk”, “tea”.</p>
                <button className="btn" type="button" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="shop-grid-wrap" key={`${params.toString()}`}>
                <ProductGrid products={result.items} onAdd={addToCart} />
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  onPage={(p) => write({ page: p })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {mobile && filterOpen && (
        <>
          <button className="overlay-scrim" aria-label="Close filters" onClick={() => setFilterOpen(false)} />
          <div className="filter-drawer">
            <div className="filter-drawer-panel">
              <div className="filter-drawer-head">
                <h2>Filters</h2>
                <button className="icon-btn" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                  <IconClose />
                </button>
              </div>
              <ShopFilters
                value={filters}
                onChange={(next) => write(next)}
                namePrefix="drawer"
                categoryList={categories}
                priceBounds={priceBounds}
              />
              <button className="btn" style={{ width: '100%', marginTop: 16 }} onClick={() => setFilterOpen(false)}>
                Show {result.total} products
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
