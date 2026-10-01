const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  handle: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aadhaarVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verificationResult: { type: String },
  verifiedAt: { type: Date },
  verificationMethod: { type: String },
  nullifierHash: { type: String, unique: true, sparse: true },
  verificationChallenge: { type: String }
}, { timestamps: true });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
