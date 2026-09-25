const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  bio:        { type: String, default: '' },
  socialLink: { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artist', artistSchema);
