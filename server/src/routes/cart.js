import { Router } from 'express'
import { merge, removeItem, replace, show, upsertItem } from '../controllers/cartController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', show)
router.put('/', replace)
router.post('/merge', merge)
router.post('/items', upsertItem)
router.delete('/items/:productId', removeItem)
export default router
