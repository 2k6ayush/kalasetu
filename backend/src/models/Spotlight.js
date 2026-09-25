const mongoose = require('mongoose');

const spotlightSchema = new mongoose.Schema({
  artistId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  title:       { type: String, required: true },
  body:        { type: String, required: true },
  aiProvider:  { type: String, default: '' },
  publishedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Spotlight', spotlightSchema);
