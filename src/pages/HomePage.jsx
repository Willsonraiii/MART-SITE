import Hero from '../components/Hero'
import CategorySection from '../components/CategorySection'
import FeaturedSection from '../components/FeaturedSection'
import OffersSection from '../components/OffersSection'
import VegetableSection from '../components/VegetableSection'
import Seo from '../components/Seo'
import { useCart } from '../context/CartContext'

const HOME_LD = {
  '@context': 'https://schema.org',
  '@type': 'GroceryStore',
  name: 'Yalamber Mini Mart',
  description: 'Neighborhood mini mart in New Baneshwor, Kathmandu.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop 12, New Baneshwor Chowk',
    addressLocality: 'Kathmandu',
    postalCode: '44600',
    addressCountry: 'NP',
  },
}

export default function HomePage() {
  const { addToCart } = useCart()

  return (
    <>
      <Seo
        title="Yalamber Mini Mart — Your Everyday Store."
        description="Fresh groceries, household essentials and daily necessities in New Baneshwor, Kathmandu."
        path="/"
        jsonLd={HOME_LD}
      />
      <Hero />
      <CategorySection />
      <FeaturedSection onAdd={addToCart} />
      <OffersSection />
      <VegetableSection onAdd={addToCart} />
    </>
  )
}
