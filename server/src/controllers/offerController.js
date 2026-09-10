import { asyncHandler } from '../utils/asyncHandler.js'
import { listOffers } from '../services/offerService.js'

export const list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await listOffers() })
})
