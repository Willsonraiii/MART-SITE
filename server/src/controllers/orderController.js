import { asyncHandler } from '../utils/asyncHandler.js'
import { createOrder, getOrder, listAllOrders, listOrdersForUser } from '../services/orderService.js'
import { ApiError } from '../utils/ApiError.js'

export const create = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({
      success: false,
      error: { message: 'JSON body required', code: 'BAD_REQUEST' },
    })
    return
  }
  const order = await createOrder(req.body, req.user || null)
  res.status(201).json({ success: true, data: order })
})

export const show = asyncHandler(async (req, res) => {
  const order = await getOrder(req.params.id)
  if (req.user?.role !== 'admin' && order.userId && req.user?.id !== order.userId) {
    throw ApiError.forbidden('That slip belongs to another account.')
  }
  res.status(200).json({ success: true, data: order })
})

export const mine = asyncHandler(async (req, res) => {
  const orders = await listOrdersForUser(req.user.id)
  res.status(200).json({ success: true, data: orders })
})

export const adminList = asyncHandler(async (req, res) => {
  const orders = await listAllOrders()
  res.status(200).json({ success: true, data: orders })
})
