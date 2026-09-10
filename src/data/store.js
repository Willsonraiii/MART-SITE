import { catalog } from './catalog'

export function formatNPR(n) {
  return `Rs. ${Number(n).toLocaleString('en-IN')}`
}

export const storeInfo = {
  name: 'Yalamber Mini Mart',
  tagline: 'Your Everyday Store.',
  address: 'Shop 12, New Baneshwor Chowk, Kathmandu 44600',
  phone: '+977 1-5901840',
  email: 'hello@yalambermart.com.np',
  hours: [
    { days: 'Sun – Fri', time: '7:00 AM – 9:00 PM' },
    { days: 'Saturday', time: '8:00 AM – 8:00 PM' },
  ],
}

export const navLinks = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'shop', label: 'Shop', to: '/shop' },
  { id: 'categories', label: 'Categories', to: '/#categories' },
  { id: 'offers', label: 'Offers', to: '/#offers' },
  { id: 'about', label: 'About', to: '/#about' },
  { id: 'contact', label: 'Contact', to: '/#contact' },
]

const categoryMeta = [
  { id: 'noodles', name: 'Instant Noodles', tone: 'coral' },
  { id: 'vegetables', name: 'Vegetables', tone: 'leaf' },
  { id: 'fruits', name: 'Fruits', tone: 'rose' },
  { id: 'dairy', name: 'Dairy', tone: 'sky' },
  { id: 'bakery', name: 'Bakery', tone: 'wheat' },
  { id: 'snacks', name: 'Snacks', tone: 'sun' },
  { id: 'tea', name: 'Tea & Coffee', tone: 'mocha' },
  { id: 'beverages', name: 'Beverages', tone: 'teal' },
  { id: 'groceries', name: 'Groceries', tone: 'olive' },
  { id: 'care', name: 'Personal Care', tone: 'lilac' },
  { id: 'household', name: 'Household', tone: 'slate' },
  { id: 'chocolates', name: 'Chocolates', tone: 'cocoa' },
]

export const categories = categoryMeta.map((c) => ({
  ...c,
  count: catalog.filter((p) => p.category === c.id).length,
}))

export const products = catalog.filter((p) => p.featured)

export const vegetables = catalog.filter((p) => p.category === 'vegetables')

export const offers = [
  {
    id: 'deal-noodles',
    kicker: "Today's Deal",
    title: 'Instant Noodles',
    tag: '20% OFF',
    detail: 'Wai Wai, Rara and every pack on the rack. Stock up for the week.',
    cta: 'Shop noodles',
    to: '/shop?category=noodles&discounted=1',
    theme: 'coral',
  },
  {
    id: 'deal-snacks',
    kicker: 'Weekend special',
    title: 'Snacks',
    tag: 'Buy 2 Get 1',
    detail: 'Chips, biscuits and namkeen — mix any three, pay for two.',
    cta: 'Grab snacks',
    to: '/shop?category=snacks',
    theme: 'gold',
  },
  {
    id: 'deal-oil',
    kicker: 'Kitchen essential',
    title: 'Cooking Oil',
    tag: '10% OFF',
    detail: 'Mustard and sunflower, 1 litre bottles. Honest pantry prices.',
    cta: 'Shop oil',
    to: '/shop?category=groceries&q=oil',
    theme: 'leaf',
  },
]

export const allCatalog = catalog
