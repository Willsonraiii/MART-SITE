import { Router } from 'express'
import { login, logout, me, register, updateMe } from '../controllers/authController.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/me', optionalAuth, me)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.patch('/profile', requireAuth, updateMe)
export default router
