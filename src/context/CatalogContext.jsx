import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PRICE_BOUNDS } from '../data/catalog'
import { setRemoteCatalog } from '../data/api'
import { categories as localCategories, offers as localOffers, products as localFeatured, vegetables as localVeg } from '../data/store'
import { fetchCategories, fetchOffers, fetchProducts } from '../lib/apiClient'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState(localFeatured)
  const [vegetables, setVegetables] = useState(localVeg)
  const [categories, setCategories] = useState(localCategories)
  const [offers, setOffers] = useState(localOffers)
  const [priceBounds, setPriceBounds] = useState(PRICE_BOUNDS)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const [featuredPage, vegPage, cats, deals] = await Promise.all([
        fetchProducts({ pageSize: 16, sort: 'popular', featured: 1 }),
        fetchProducts({ category: 'vegetables', pageSize: 12, sort: 'popular' }),
        fetchCategories(),
        fetchOffers(),
      ])
      const featuredItems = featuredPage.items || []
      const vegItems = vegPage.items || []
      const merged = [...featuredItems]
      vegItems.forEach((item) => {
        if (!merged.some((row) => row.id === item.id)) merged.push(item)
      })
      setRemoteCatalog(merged)
      setProducts(merged)
      setFeatured(featuredItems.length ? featuredItems : localFeatured)
      setVegetables(vegItems.length ? vegItems : localVeg)
      if (featuredPage.bounds) setPriceBounds(featuredPage.bounds)
      if (Array.isArray(cats) && cats.length) setCategories(cats)
      if (Array.isArray(deals) && deals.length) setOffers(deals)
      setStatus('ready')
    } catch (err) {
      setRemoteCatalog(null)
      setProducts([])
      setFeatured(localFeatured)
      setVegetables(localVeg)
      setCategories(localCategories)
      setOffers(localOffers)
      setError(err.message || 'Could not reach the store.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({
      products,
      categories,
      offers,
      featured,
      vegetables,
      priceBounds,
      status,
      error,
      usingFallback: status !== 'ready',
      reload: load,
    }),
    [products, categories, offers, featured, vegetables, priceBounds, status, error, load],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
