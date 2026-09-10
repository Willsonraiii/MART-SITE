import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { authenticateUser, registerUser, updateProfile } from '../services/userService.js'
import { clearAuthCookie, setAuthCookie, signToken } from '../middleware/auth.js'
import { findUserById } from '../services/userService.js'
import { publicUser } from '../db/map.js'

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user || null } })
})

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body || {})
  const token = signToken(user)
  setAuthCookie(req, res, token)
  res.status(201).json({ success: true, data: { user, token } })
})

export const login = asyncHandler(async (req, res) => {
  const login = req.body?.email || req.body?.login || req.body?.phone
  const user = await authenticateUser(login, req.body?.password)
  const token = signToken(user)
  setAuthCookie(req, res, token)
  res.status(200).json({ success: true, data: { user, token } })
})

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(req, res)
  res.status(200).json({ success: true, data: { user: null } })
})

export const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized()
  const user = await updateProfile(req.user.id, req.body || {})
  res.status(200).json({ success: true, data: { user } })
})

export const showAdminPing = asyncHandler(async (req, res) => {
  const fresh = await findUserById(req.user.id)
  res.status(200).json({
    success: true,
    data: { ok: true, role: req.user.role, user: publicUser(fresh) },
  })
})
