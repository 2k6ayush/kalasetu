const mongoose = require('mongoose');

const craftEntrySchema = new mongoose.Schema({
  practitionerName: { type: String, required: true },
  craftName:        { type: String, required: true },
  region:           { type: String, default: '' },
  description:      { type: String, required: true },
  images:           { type: [String], default: [] },
  steps:            { type: [String], default: [] },
  aiProvider:       { type: String, default: '' },
  publishedAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('CraftEntry', craftEntrySchema);
