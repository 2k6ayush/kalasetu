const mongoose = require('mongoose');

const exploreHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  placeKey: {
    type: String,
    required: true,
  },
  placeName: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  firstExploredAt: { type: Date, default: Date.now },
  lastExploredAt: { type: Date, default: Date.now },
  exploreCount: { type: Number, default: 1 }
}, { timestamps: true });

// Ensure unique composite index for userId + placeKey
exploreHistorySchema.index({ userId: 1, placeKey: 1 }, { unique: true });

module.exports = mongoose.model('ExploreHistory', exploreHistorySchema);
