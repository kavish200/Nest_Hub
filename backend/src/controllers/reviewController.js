const mongoose = require('mongoose');
const Review = require('../../models/Review');
const Rating = require('../../models/Rating');
const User = require('../../models/User');
const Listing = require('../../models/Listing');

const roundTwo = (value) => Math.round((value || 0) * 100) / 100;

const updateListingRatingSummary = async (listingId) => {
  const objectListingId = new mongoose.Types.ObjectId(listingId);

  const [summary] = await Rating.aggregate([
    { $match: { listing_id: objectListingId } },
    {
      $group: {
        _id: '$listing_id',
        ratings_count: { $sum: 1 },
        average_noise_score: { $avg: '$noise_score' },
        average_water_score: { $avg: '$water_score' },
        average_power_score: { $avg: '$power_score' }
      }
    }
  ]);

  const ratingsCount = summary?.ratings_count || 0;
  const averageNoise = roundTwo(summary?.average_noise_score || 0);
  const averageWater = roundTwo(summary?.average_water_score || 0);
  const averagePower = roundTwo(summary?.average_power_score || 0);
  const averageOverall = roundTwo(
    ratingsCount > 0 ? (averageNoise + averageWater + averagePower) / 3 : 0
  );

  await Listing.findByIdAndUpdate(listingId, {
    ratings_count: ratingsCount,
    average_noise_score: averageNoise,
    average_water_score: averageWater,
    average_power_score: averagePower,
    average_rating: averageOverall
  });
};

const createReview = async (req, res) => {
  try {
    const { listing_id, review_text } = req.body;
    const tenant_id = req.user?.userId;

    if (!listing_id || !tenant_id || !review_text) {
      return res.status(400).json({
        message: 'listing_id and review_text are required'
      });
    }

    if (!mongoose.isValidObjectId(listing_id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(listing_id).select('_id');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const review = await Review.create({
      listing_id,
      tenant_id,
      review_text
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { listing_id, tenant_id } = req.query;
    const filter = {};

    if (listing_id) filter.listing_id = listing_id;
    if (tenant_id) filter.tenant_id = tenant_id;

    const reviews = await Review.find(filter)
      .sort({ created_at: -1 })
      .populate('listing_id', 'title city locality type price')
      .populate('tenant_id', 'name email phone');

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createRating = async (req, res) => {
  try {
    const { listing_id, noise_score, water_score, power_score } = req.body;
    const tenant_id = req.user?.userId;

    if (!listing_id || !tenant_id || !noise_score || !water_score || !power_score) {
      return res.status(400).json({
        message: 'listing_id, noise_score, water_score and power_score are required'
      });
    }

    if (!mongoose.isValidObjectId(listing_id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(listing_id).select('_id');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const tenant = await User.findById(tenant_id).select('role is_verified');
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can leave ratings' });
    }

    if (!tenant.is_verified) {
      return res.status(403).json({ message: 'Only verified tenants can leave ratings' });
    }

    const existingRating = await Rating.findOne({ listing_id, tenant_id });
    if (existingRating) {
      return res.status(409).json({
        message: 'You have already rated this listing. One tenant can rate a listing only once.'
      });
    }

    const rating = await Rating.create({
      listing_id,
      tenant_id,
      noise_score,
      water_score,
      power_score
    });

    await updateListingRatingSummary(listing_id);

    return res.status(201).json(rating);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'You have already rated this listing. One tenant can rate a listing only once.'
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getRatings = async (req, res) => {
  try {
    const { listing_id, tenant_id } = req.query;
    const filter = {};

    if (listing_id) filter.listing_id = listing_id;
    if (tenant_id) filter.tenant_id = tenant_id;

    const ratings = await Rating.find(filter)
      .sort({ created_at: -1 })
      .populate('listing_id', 'title city locality type price')
      .populate('tenant_id', 'name email phone');

    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  deleteReview,
  createRating,
  getRatings
};
