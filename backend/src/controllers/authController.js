const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

let vKey;
try {
  vKey = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/verification_key.json')));
} catch (e) {
  console.warn("Could not load verification_key.json");
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, handle, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { handle }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      handle,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        aadhaarVerified: user.aadhaarVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        aadhaarVerified: user.aadhaarVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChallenge = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.verificationChallenge = crypto.randomBytes(16).toString('hex');
    await user.save();
    res.json({ challenge: user.verificationChallenge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyProof = async (req, res) => {
  try {
    const { proof, publicSignals, signal, nullifier } = req.body;
    if (!proof || !publicSignals) return res.status(400).json({ error: 'Proof and publicSignals are required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.verificationChallenge !== signal) {
      return res.status(400).json({ error: 'Invalid or expired challenge signal' });
    }
    
    // We expect the challenge string to be converted to the integer in the circuit
    const challengeNum = parseInt(signal.substring(0, 8), 16).toString();
    if (publicSignals[2] !== challengeNum) {
      return res.status(400).json({ error: 'Proof does not match the requested challenge' });
    }

    if (!vKey) {
      return res.status(500).json({ error: 'Verification key not loaded on server' });
    }

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    if (!isValid) {
      return res.status(400).json({ error: 'The identity proof could not be verified.' });
    }

    const nullifierHash = nullifier || publicSignals[0];

    const existing = await User.findOne({ nullifierHash });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return res.status(400).json({ error: 'This credential has already been used for a verified Kalāsetu creator account.' });
    }

    user.aadhaarVerified = true;
    user.verificationStatus = 'approved';
    user.verificationMethod = 'zk-demo';
    user.verificationResult = 'Cryptographically verified ZK Proof';
    user.nullifierHash = nullifierHash;
    user.verifiedAt = new Date();
    user.verificationChallenge = null;
    await user.save();

    res.json({ success: true, message: 'Identity verified privately.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proof verification failed on server.' });
  }
};

module.exports = { registerUser, loginUser, getMe, getChallenge, verifyProof };
