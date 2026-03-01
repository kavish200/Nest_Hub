const express = require('express');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviews,
  deleteReview,
  createRating,
  getRatings
} = require('../controllers/reviewController');

const router = express.Router();

router.post('/reviews', requireAuth, requireRole('tenant'), createReview);
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

router.post('/ratings', requireAuth, requireRole('tenant'), createRating);
router.get('/ratings', getRatings);

module.exports = router;
