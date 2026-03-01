const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    review_text: {
      type: String,
      required: true,
      trim: true
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

module.exports = mongoose.model('Review', reviewSchema);
