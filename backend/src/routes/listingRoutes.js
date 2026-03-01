const express = require('express');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  createListing,
  getListings,
  searchListings,
  getListingById,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

const router = express.Router();

router.post('/', requireAuth, requireRole('owner'), createListing);
router.get('/', getListings);
router.get('/search', searchListings);
router.get('/:id', getListingById);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
