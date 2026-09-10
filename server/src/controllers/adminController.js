import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { dashboardStats, getSettings, listCustomers, updateSettings } from '../services/adminService.js'
import { allProducts, createProduct, deleteProduct, getProduct, updateProduct } from '../services/productService.js'
import {
  createCategory,
  deleteCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from '../services/categoryService.js'
import { createOffer, deleteOffer, listAllOffers, updateOffer } from '../services/offerService.js'
import { getOrder, listAllOrders, updateOrderStatus } from '../services/orderService.js'
import { publicUploadPath } from '../middleware/upload.js'

export const stats = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await dashboardStats() })
})

export const orders = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listAllOrders() })
})

export const showOrder = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getOrder(req.params.id) })
})

export const patchOrder = asyncHandler(async (req, res) => {
  const status = String(req.body?.status || '')
  const order = await updateOrderStatus(req.params.id, status)
  res.status(200).json({ success: true, data: order })
})

export const products = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await allProducts() })
})

export const showProduct = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getProduct(req.params.id) })
})

export const addProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body || {})
  res.status(201).json({ success: true, data: product })
})

export const patchProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body || {})
  res.status(200).json({ success: true, data: product })
})

export const removeProduct = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await deleteProduct(req.params.id) })
})

export const categories = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listCategories() })
})

export const addCategory = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body || {})
  res.status(201).json({ success: true, data: category })
})

export const patchCategory = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body || {})
  res.status(200).json({ success: true, data: category })
})

export const removeCategory = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await deleteCategory(req.params.id) })
})

export const sortCategories = asyncHandler(async (req, res) => {
  const list = await reorderCategories(req.body?.ids || req.body)
  res.status(200).json({ success: true, data: list })
})

export const offers = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listAllOffers() })
})

export const addOffer = asyncHandler(async (req, res) => {
  const offer = await createOffer(req.body || {})
  res.status(201).json({ success: true, data: offer })
})

export const patchOffer = asyncHandler(async (req, res) => {
  const offer = await updateOffer(req.params.id, req.body || {})
  res.status(200).json({ success: true, data: offer })
})

export const removeOffer = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await deleteOffer(req.params.id) })
})

export const customers = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listCustomers() })
})

export const settings = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getSettings() })
})

export const patchSettings = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await updateSettings(req.body || {}) })
})

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.unprocessable('Choose an image to upload.', { image: 'Required.' })
  const url = publicUploadPath(req.file.filename)
  res.status(201).json({ success: true, data: { url, filename: req.file.filename } })
})
