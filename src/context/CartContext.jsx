import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadCart,
  loadOrder,
  saveCart,
  saveOrder,
  stockMax,
  summarize,
  toCartItem,
} from '../lib/cart'
import { createOrder, fetchServerCart, mapApiOrder, mergeServerCart, replaceServerCart } from '../lib/apiClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, ready, consumeAuthEvent } = useAuth()
  const [cart, setCart] = useState(() => (typeof window === 'undefined' ? [] : loadCart()))
  const [lastOrder, setLastOrder] = useState(() => (typeof window === 'undefined' ? null : loadOrder()))
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(0)
  const cartRef = useRef(cart)
  cartRef.current = cart
  const skipSync = useRef(false)
  const hydratedFor = useRef(null)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const notify = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    if (!user) {
      hydratedFor.current = null
      return undefined
    }
    if (hydratedFor.current === user.id) return undefined
    hydratedFor.current = user.id
    const event = consumeAuthEvent()
    skipSync.current = true
    const guest = cartRef.current.map((item) => ({ id: item.id, qty: item.qty }))
    const task = event === 'login' ? mergeServerCart(guest) : fetchServerCart()
    task
      .then((data) => {
        setCart(data?.items || [])
      })
      .catch(() => {
        /* keep local bag */
      })
      .finally(() => {
        skipSync.current = false
      })
    return undefined
  }, [user, ready, consumeAuthEvent])

  useEffect(() => {
    if (!user || skipSync.current) return undefined
    const t = window.setTimeout(() => {
      replaceServerCart(cart.map((item) => ({ id: item.id, qty: item.qty }))).catch(() => {})
    }, 450)
    return () => window.clearTimeout(t)
  }, [cart, user])

  const addToCart = useCallback(
    (product, qty = 1) => {
      if (!product || product.stock === 'out') {
        notify('That one is out of stock')
        return
      }
      const max = stockMax(product)
      const current = cartRef.current.find((item) => item.id === product.id)?.qty || 0
      const nextQty = Math.min(max, current + Math.max(1, qty))
      if (nextQty <= current) {
        notify(`Only ${max} left on the rack`)
        return
      }
      setCart((prev) => {
        const found = prev.find((item) => item.id === product.id)
        if (found) {
          return prev.map((item) =>
            item.id === product.id ? toCartItem(product, nextQty) : item,
          )
        }
        return [...prev, toCartItem(product, nextQty)]
      })
      notify('Added to cart ✓')
    },
    [notify],
  )

  const setQty = useCallback((id, qty) => {
    setCart((prev) => {
      const item = prev.find((row) => row.id === id)
      if (!item) return prev
      if (qty < 1) return prev.filter((row) => row.id !== id)
      const max = stockMax(item)
      return prev.map((row) => (row.id === id ? toCartItem(row, Math.min(max, qty)) : row))
    })
  }, [])

  const remove = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
    notify('Removed from bag')
  }, [notify])

  const clearCart = useCallback(() => setCart([]), [])

  const buyNow = useCallback(
    (product, qty = 1) => {
      addToCart(product, qty)
      setCartOpen(true)
    },
    [addToCart],
  )

  const placeOrder = useCallback(async (details) => {
    if (!cart.length) return null
    try {
      const created = await createOrder({
        customer: details.customer,
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        paymentMethod: details.payment,
      })
      const order = mapApiOrder(created)
      saveOrder(order)
      setLastOrder(order)
      skipSync.current = true
      setCart([])
      setCartOpen(false)
      window.setTimeout(() => {
        skipSync.current = false
      }, 0)
      return order
    } catch (err) {
      notify(err.message || 'Could not place the order.')
      return null
    }
  }, [cart, notify])

  const totals = useMemo(() => summarize(cart), [cart])

  const value = useMemo(
    () => ({
      cart,
      cartCount: totals.count,
      totals,
      addToCart,
      setQty,
      remove,
      clearCart,
      buyNow,
      placeOrder,
      lastOrder,
      menuOpen,
      setMenuOpen,
      searchOpen,
      setSearchOpen,
      cartOpen,
      setCartOpen,
      toast,
    }),
    [
      cart,
      totals,
      addToCart,
      setQty,
      remove,
      clearCart,
      buyNow,
      placeOrder,
      lastOrder,
      menuOpen,
      searchOpen,
      cartOpen,
      toast,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
