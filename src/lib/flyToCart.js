export function flyToCart(fromEl) {
  if (!fromEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const cartBtn = document.querySelector('[data-cart-btn]')
  const img = fromEl.tagName === 'IMG' ? fromEl : fromEl.querySelector?.('img')
  if (!cartBtn || !img) return

  const start = img.getBoundingClientRect()
  const end = cartBtn.getBoundingClientRect()
  const clone = img.cloneNode(true)
  clone.className = 'fly-img'
  clone.alt = ''
  clone.style.position = 'fixed'
  clone.style.left = `${start.left}px`
  clone.style.top = `${start.top}px`
  clone.style.width = `${start.width}px`
  clone.style.height = `${start.height}px`
  document.body.appendChild(clone)

  const dx = end.left + end.width / 2 - (start.left + start.width / 2)
  const dy = end.top + end.height / 2 - (start.top + start.height / 2)

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.18)`
    clone.style.opacity = '0.15'
  })

  window.setTimeout(() => clone.remove(), 720)
  cartBtn.classList.add('cart-bump')
  window.setTimeout(() => cartBtn.classList.remove('cart-bump'), 500)
}
