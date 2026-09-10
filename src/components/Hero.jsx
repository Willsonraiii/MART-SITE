import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'
import { assetPath } from '../lib/assetPath.js'
import './Hero.css'

const Scene3D = lazy(() => import('./Scene3D'))

class CanvasError extends Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }

  static getDerivedStateFromError() {
    return { error: true }
  }

  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function FallbackScene() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <article className="float-card">
        <img src={assetPath('/images/wai-wai.jpg')} alt="" />
      </article>
      <article className="float-card">
        <img src={assetPath('/images/milk.jpg')} alt="" />
      </article>
      <article className="float-card">
        <img src={assetPath('/images/bread.jpg')} alt="" />
      </article>
    </div>
  )
}

function TruckIcon() {
  return (
    <svg className="perk-icon" viewBox="0 0 88 64" fill="none" aria-hidden="true">
      <path d="M8 40h46l.5-18.5H22L8 32v8Z" stroke="#b07a3a" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M54.5 28.5H74l6 11.5H54.5V28.5Z" stroke="#b07a3a" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="24" cy="48" r="6.5" stroke="#b07a3a" strokeWidth="2.2" />
      <circle cx="68" cy="48" r="6.5" stroke="#b07a3a" strokeWidth="2.2" />
      <path d="M18 26c4-8 14-12 22-7" stroke="#3d8a58" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="22" r="3.2" fill="#e24b3b" />
      <circle cx="36" cy="18" r="3.6" fill="#f0b429" />
      <circle cx="42" cy="24" r="3.2" fill="#3d8a58" />
    </svg>
  )
}

function BasketIcon() {
  return (
    <svg className="perk-icon" viewBox="0 0 88 64" fill="none" aria-hidden="true">
      <path d="M22 30h44l-4 22H26L22 30Z" stroke="#c45d2c" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M30 30c0-10 6-18 14-18s14 8 14 18" stroke="#c45d2c" strokeWidth="2.2" />
      <path d="M28 38h32M30 46h28" stroke="#c45d2c" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 22c-2-6 2-10 6-8 1 4-2 8-6 8Z" fill="#3d8a58" />
      <path d="M50 24c2-7 8-8 10-4-2 4-6 6-10 4Z" fill="#2f6b47" />
      <circle cx="46" cy="20" r="3.4" fill="#7dce6a" />
    </svg>
  )
}

export default function Hero() {
  const mobile = useMediaQuery('(max-width: 960px)')
  const reduced = usePrefersReducedMotion()
  const [webgl] = useState(() => hasWebGL())
  const visualRef = useRef(null)
  const [onScreen, setOnScreen] = useState(true)
  const [photoOk, setPhotoOk] = useState(true)

  useEffect(() => {
    const el = visualRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '120px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const show3d = webgl && onScreen && !photoOk

  return (
    <section className="hero" id="home">
      <div className="wrap">
        <div className="hero-banner" ref={visualRef}>
          {show3d ? (
            <CanvasError fallback={<FallbackScene />}>
              <Suspense fallback={null}>
                <Scene3D mobile={mobile} reduced={reduced} />
              </Suspense>
            </CanvasError>
          ) : null}
          {photoOk && (
            <img
              className="hero-produce"
              src={assetPath('/images/hero-produce.jpg')}
              alt="Fresh vegetables arranged on a slate table"
              onError={() => setPhotoOk(false)}
            />
          )}
          <div className="hero-banner-copy">
            <h1>
              Everything you need
              <span>for delicious meal</span>
            </h1>
            <p>delivered in as little as one hour</p>
            <Link className="hero-shop-btn" to="/shop">Shop Now</Link>
          </div>
        </div>

        <ul className="hero-perks">
          <li>
            <TruckIcon />
            <h2>Free local delivery</h2>
            <p>on orders across New Baneshwor</p>
          </li>
          <li>
            <BasketIcon />
            <h2>We pick only the freshest goods</h2>
            <p>your must-haves, on the racks today</p>
          </li>
          <li>
            <div className="perk-stamp" aria-hidden="true">
              <small>100%</small>
              <b>natural</b>
              <em>Fresh</em>
            </div>
            <h2>Money-back guarantee</h2>
            <p>order online, pick up at the shop</p>
          </li>
        </ul>
      </div>
    </section>
  )
}
