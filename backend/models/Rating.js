const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    noise_score: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    water_score: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    power_score: {
      type: Number,
      required: true,
      min: 1,
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

ratingSchema.index({ listing_id: 1, tenant_id: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
