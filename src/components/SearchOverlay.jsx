import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchProducts } from '../data/api'
import { useCatalog } from '../context/CatalogContext'
import { formatNPR } from '../data/store'
import { fetchProducts } from '../lib/apiClient'
import { IconClose } from './Icons'
import './Overlays.css'

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { categories } = useCatalog()

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || id

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40)
      document.body.classList.add('overlay-lock')
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('overlay-lock')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined
    const q = query.trim()
    const ac = new AbortController()
    if (!q) {
      setSearching(true)
      fetchProducts({ pageSize: 8, sort: 'popular' }, { signal: ac.signal })
        .then((data) => setResults(data.items || []))
        .catch(() => setResults(searchProducts('', 8)))
        .finally(() => setSearching(false))
      return () => ac.abort()
    }
    setSearching(true)
    const t = window.setTimeout(() => {
      fetchProducts({ q, pageSize: 8 }, { signal: ac.signal })
        .then((data) => setResults(data.items || []))
        .catch(() => setResults(searchProducts(q, 8)))
        .finally(() => setSearching(false))
    }, 160)
    return () => {
      ac.abort()
      window.clearTimeout(t)
    }
  }, [query, open])

  if (!open) return null

  const hasQuery = query.trim().length > 0

  const goProduct = (id) => {
    onClose()
    setQuery('')
    navigate(`/product/${id}`)
  }

  const goShop = () => {
    const q = query.trim()
    onClose()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    setQuery('')
  }

  return (
    <>
      <button className="overlay-scrim" aria-label="Close search" onClick={onClose} />
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search products">
        <div className="drawer-head" style={{ padding: '0 0 12px' }}>
          <h2>Search the shelves</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close search">
            <IconClose />
          </button>
        </div>
        <div className="search-field">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goShop()
            }}
            placeholder="Try wai, milk, tomato…"
            aria-label="Search products"
          />
          {hasQuery && (
            <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              Clear
            </button>
          )}
        </div>
        <div className="search-results">
          {searching && <p className="search-hint">Looking through the racks…</p>}
          {hasQuery && !searching && results.length === 0 && (
            <p className="empty">No matches for “{query.trim()}”. Try a brand, aisle, or keyword.</p>
          )}
          {!hasQuery && !searching && <p className="search-hint">Suggestions from the racks</p>}
          {results.map((item) => (
            <button
              key={item.id}
              className="search-item"
              onClick={() => goProduct(item.id)}
            >
              <img src={item.image} alt="" />
              <span>
                <strong>{item.name}</strong>
                <br />
                <small>{item.brand} · {categoryName(item.category)} · {item.unit || item.weight}</small>
              </span>
              <span className="price">{formatNPR(item.price)}</span>
            </button>
          ))}
        </div>
        <div className="search-foot">
          <button className="btn btn-ghost" type="button" onClick={goShop}>
            {hasQuery ? `See all results for “${query.trim()}”` : 'Browse the shop'}
          </button>
        </div>
      </div>
    </>
  )
}
