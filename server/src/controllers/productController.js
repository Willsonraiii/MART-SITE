import { asyncHandler } from '../utils/asyncHandler.js'
import { getProduct, listProducts, relatedProducts } from '../services/productService.js'

export const list = asyncHandler(async (req, res) => {
  const data = await listProducts(req.query)
  res.status(200).json({ success: true, data })
})

export const show = asyncHandler(async (req, res) => {
  const product = await getProduct(req.params.id)
  res.status(200).json({
    success: true,
    data: {
      ...product,
      related: await relatedProducts(product, 4),
    },
  })
})
