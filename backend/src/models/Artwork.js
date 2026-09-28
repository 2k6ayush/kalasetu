const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  artistId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  imagePath:        { type: String, default: '' },
  artistNote:       { type: String, default: '' },
  tags: {
    medium:            { type: String, default: '' },
    technique:         { type: String, default: '' },
    culturalInfluence: { type: String, default: '' },
    mood:              { type: [String], default: [] },
  },
  moderationStatus: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
  moderationReason: { type: String, default: '' },
  aiProvider:       { type: String, default: '' },
  createdAt:        { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artwork', artworkSchema);
