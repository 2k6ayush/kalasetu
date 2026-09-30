const mongoose = require('mongoose');

const placeKnowledgeSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  knowledgeData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PlaceKnowledge', placeKnowledgeSchema);
