import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import SearchOverlay from './components/SearchOverlay'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import ScrollManager from './components/ScrollManager'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import NotFound from './pages/NotFound'
import AdminApp from './admin/AdminApp'
import { useCart } from './context/CartContext'

function StoreShell() {
  const {
    cartCount,
    menuOpen,
    setMenuOpen,
    searchOpen,
    setSearchOpen,
    setCartOpen,
    toast,
  } = useCart()

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollManager />
      <Header
        cartCount={cartCount}
        onSearch={() => setSearchOpen(true)}
        onCart={() => setCartOpen(true)}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <Toast message={toast} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<StoreShell />} />
    </Routes>
  )
}
