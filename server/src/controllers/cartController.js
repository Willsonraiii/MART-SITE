import { asyncHandler } from '../utils/asyncHandler.js'
import { getCart, mergeCart, removeCartItem, replaceCart, setCartItem } from '../services/cartService.js'

export const show = asyncHandler(async (req, res) => {
  const items = await getCart(req.user.id)
  res.status(200).json({ success: true, data: { items } })
})

export const replace = asyncHandler(async (req, res) => {
  const items = await replaceCart(req.user.id, req.body?.items || [])
  res.status(200).json({ success: true, data: { items } })
})

export const merge = asyncHandler(async (req, res) => {
  const items = await mergeCart(req.user.id, req.body?.items || [])
  res.status(200).json({ success: true, data: { items } })
})

export const upsertItem = asyncHandler(async (req, res) => {
  const items = await setCartItem(req.user.id, req.body?.id || req.body?.productId, req.body?.qty)
  res.status(200).json({ success: true, data: { items } })
})

export const removeItem = asyncHandler(async (req, res) => {
  const items = await removeCartItem(req.user.id, req.params.productId)
  res.status(200).json({ success: true, data: { items } })
})
