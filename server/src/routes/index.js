import { Router } from 'express'
import products from './products.js'
import categories from './categories.js'
import offers from './offers.js'
import orders from './orders.js'
import auth from './auth.js'
import cart from './cart.js'
import admin from './admin.js'

const router = Router()
router.use('/products', products)
router.use('/categories', categories)
router.use('/offers', offers)
router.use('/orders', orders)
router.use('/auth', auth)
router.use('/cart', cart)
router.use('/admin', admin)
export default router
