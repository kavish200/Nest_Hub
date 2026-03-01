const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['PG', 'Flat', 'Hostel'],
      required: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    locality: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image_url: {
      type: String,
      trim: true,
      default: ''
    },
    ratings_count: {
      type: Number,
      default: 0,
      min: 0
    },
    average_noise_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    average_water_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    average_power_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false
    },
    versionKey: false
  }
);

module.exports = mongoose.model('Listing', listingSchema);
