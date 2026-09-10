import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { imageUpload } from '../middleware/upload.js'
import { showAdminPing } from '../controllers/authController.js'
import * as admin from '../controllers/adminController.js'

const router = Router()
router.use(requireAdmin)

router.get('/ping', showAdminPing)
router.get('/stats', admin.stats)

router.get('/orders', admin.orders)
router.get('/orders/:id', admin.showOrder)
router.patch('/orders/:id', admin.patchOrder)

router.get('/products', admin.products)
router.post('/products', admin.addProduct)
router.get('/products/:id', admin.showProduct)
router.patch('/products/:id', admin.patchProduct)
router.delete('/products/:id', admin.removeProduct)

router.post('/uploads', imageUpload.single('image'), admin.uploadImage)

router.get('/categories', admin.categories)
router.post('/categories', admin.addCategory)
router.put('/categories/reorder', admin.sortCategories)
router.patch('/categories/:id', admin.patchCategory)
router.delete('/categories/:id', admin.removeCategory)

router.get('/offers', admin.offers)
router.post('/offers', admin.addOffer)
router.patch('/offers/:id', admin.patchOffer)
router.delete('/offers/:id', admin.removeOffer)

router.get('/customers', admin.customers)
router.get('/settings', admin.settings)
router.patch('/settings', admin.patchSettings)

export default router
