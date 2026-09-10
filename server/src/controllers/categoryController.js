import { asyncHandler } from '../utils/asyncHandler.js'
import { getCategory, listCategories } from '../services/categoryService.js'

export const list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listCategories() })
})

export const show = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getCategory(req.params.id) })
})
