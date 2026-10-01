const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  artist:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:             { type: String, enum: ['IMAGE', 'VIDEO', 'AUDIO', 'TEXT'], default: 'IMAGE' },
  title:            { type: String, default: '' },
  imagePath:        { type: String, default: '' }, // acts as mediaUrl for video/audio too
  artistNote:       { type: String, default: '' }, // used as text content for text posts
  tags: {
    medium:            { type: String, default: '' },
    technique:         { type: String, default: '' },
    culturalInfluence: { type: String, default: '' },
    mood:              { type: [String], default: [] },
  },
  moderationStatus: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
  moderationReason: { type: String, default: '' },
  zkProofHash:      { type: String, default: null },
  aiProvider:       { type: String, default: '' },
  visibility:       { type: String, enum: ['public', 'private'], default: 'public' },
  createdAt:        { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artwork', artworkSchema);
