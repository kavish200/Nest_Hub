const mongoose = require('mongoose');
const Listing = require('../../models/Listing');

const toRatingSummary = (listing) => {
  const plain = listing.toObject ? listing.toObject() : listing;
  return {
    ...plain,
    rating_summary: {
      count: plain.ratings_count || 0,
      average_noise_score: plain.average_noise_score || 0,
      average_water_score: plain.average_water_score || 0,
      average_power_score: plain.average_power_score || 0,
      average_rating: plain.average_rating || 0
    }
  };
};

const createListing = async (req, res) => {
  try {
    const { title, type, city, locality, price, description, image_url } = req.body;
    const owner_id = req.user?.userId;

    if (!owner_id || !title || !type || !city || !locality || price === undefined || !description) {
      return res.status(400).json({
        message: 'title, type, city, locality, price and description are required'
      });
    }

    const listing = await Listing.create({
      owner_id,
      title,
      type,
      city,
      locality,
      price,
      description,
      image_url
    });

    return res.status(201).json(toRatingSummary(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { city, locality, type, owner_id } = req.query;
    const filter = {};

    if (city) filter.city = city;
    if (locality) filter.locality = locality;
    if (type) filter.type = type;
    if (owner_id) filter.owner_id = owner_id;

    const listings = await Listing.find(filter)
      .sort({ created_at: -1 })
      .populate('owner_id', 'name email phone role is_verified');

    return res.status(200).json(listings.map(toRatingSummary));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchListings = async (req, res) => {
  try {
    const {
      q,
      city,
      locality,
      type,
      owner_id,
      min_price,
      max_price,
      sort_by = 'created_at',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (locality) {
      filter.locality = { $regex: locality, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (owner_id) {
      filter.owner_id = owner_id;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { locality: { $regex: q, $options: 'i' } }
      ];
    }

    if (min_price !== undefined || max_price !== undefined) {
      filter.price = {};
      if (min_price !== undefined) filter.price.$gte = Number(min_price);
      if (max_price !== undefined) filter.price.$lte = Number(max_price);
    }

    const sortableFields = new Set(['created_at', 'price', 'title', 'city']);
    const safeSortBy = sortableFields.has(sort_by) ? sort_by : 'created_at';
    const safeOrder = order === 'asc' ? 1 : -1;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ [safeSortBy]: safeOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('owner_id', 'name email phone role is_verified'),
      Listing.countDocuments(filter)
    ]);

    return res.status(200).json({
      data: listings.map(toRatingSummary),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.max(Math.ceil(total / limitNum), 1)
      },
      filters: {
        q: q || null,
        city: city || null,
        locality: locality || null,
        type: type || null,
        owner_id: owner_id || null,
        min_price: min_price !== undefined ? Number(min_price) : null,
        max_price: max_price !== undefined ? Number(max_price) : null,
        sort_by: safeSortBy,
        order: safeOrder === 1 ? 'asc' : 'desc'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(id).populate(
      'owner_id',
      'name email phone role is_verified'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.status(200).json(toRatingSummary(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.status(200).json(toRatingSummary(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  searchListings,
  getListingById,
  updateListing,
  deleteListing
};
