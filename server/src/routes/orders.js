import { Router } from 'express'
import { create, mine, show } from '../controllers/orderController.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/', requireAuth, mine)
router.post('/', optionalAuth, create)
router.get('/:id', optionalAuth, show)
export default router
