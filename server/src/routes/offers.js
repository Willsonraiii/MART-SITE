import { Router } from 'express'
import { list } from '../controllers/offerController.js'

const router = Router()
router.get('/', list)
export default router
