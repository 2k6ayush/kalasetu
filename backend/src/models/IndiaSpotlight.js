const mongoose = require('mongoose');

const indiaSpotlightSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  body:        { type: String, required: true },
  artType:     { type: String, required: true },
  state:       { type: String, required: true },
  imageUrl:    { type: String, default: null },    // Pexels photo URL
  imageCredit: { type: String, default: null },    // Photographer credit
  aiProvider:  { type: String, default: 'groq' },
  publishedAt: { type: Date,   default: Date.now },
});

module.exports = mongoose.model('IndiaSpotlight', indiaSpotlightSchema);
