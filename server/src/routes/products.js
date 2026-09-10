import { Router } from 'express'
import { list, show } from '../controllers/productController.js'

const router = Router()
router.get('/', list)
router.get('/:id', show)
export default router
