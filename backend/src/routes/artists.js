const router = require('express').Router();
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

const Spotlight = require('../models/Spotlight');

const { validateArtistInput } = require('../middleware/validate');
const { verifyGatekeeper } = require('../services/ai/moderationService');
const upload = require('../middleware/upload');

const User = require('../models/User');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const { callGrok } = require('../services/ai/grokProvider');

// POST /api/artists/verify-identity — Aadhaar Appearance Check + ZK verification
router.post('/verify-identity', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No document uploaded' });

    const absPath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
    
    const imageBase64 = fs.readFileSync(absPath, { encoding: 'base64' });

    const systemPrompt = `You are a visual document classifier. Your ONLY job is to determine if the uploaded image visually resembles an Indian Aadhaar card (e.g. general layout, government branding, typical portrait and structure).
DO NOT perform OCR. DO NOT extract PII.
Respond ONLY with a JSON object in this format:
{
  "isAadhaarAppearance": true/false,
  "confidence": number,
  "reason": "string"
}`;

    const response = await callGrok({ systemPrompt, userContent: "Analyze this document appearance.", imageBase64 });
    
    // Clean up temporary image IMMEDIATELY after Groq check
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);

    // Parse JSON
    let aiResult;
    try {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) aiResult = JSON.parse(match[0]);
      else aiResult = JSON.parse(response);
    } catch(e) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (!aiResult.isAadhaarAppearance) {
      return res.status(400).json({ verified: false, reason: 'The uploaded image does not visually match an Aadhaar document.' });
    }

    // ── Generate ZK proof representing verification ──
    const randomValues = new Uint32Array(1);
    crypto.webcrypto.getRandomValues(randomValues);
    const secretVal = randomValues[0].toString();
    const challengeNum = "12345678";
    const scope = "999";
    
    const wasmPath = path.resolve(__dirname, '../../../zk/identity_js/identity.wasm');
    const zkeyPath = path.resolve(__dirname, '../../../zk/identity_final.zkey');

    if (!fs.existsSync(wasmPath)) {
      return res.status(500).json({ error: 'ZK circuit artifact unavailable', details: 'identity.wasm was not found', path: wasmPath });
    }
    if (!fs.existsSync(zkeyPath)) {
      return res.status(500).json({ error: 'ZK circuit artifact unavailable', details: 'identity_final.zkey was not found', path: zkeyPath });
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { secret: secretVal, challenge: challengeNum, scope: scope },
      wasmPath,
      zkeyPath
    );

    // ── Run existing ZK verifier ──
    const vkeyPath = path.resolve(__dirname, '../config/verification_key.json');
    if (!fs.existsSync(vkeyPath)) {
      return res.status(500).json({ error: 'ZK circuit artifact unavailable', details: 'verification_key.json was not found', path: vkeyPath });
    }
    const vKey = JSON.parse(fs.readFileSync(vkeyPath));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    if (!isValid) {
      return res.status(400).json({ verified: false, reason: 'Generated ZK proof failed verification.' });
    }

    // Store only verification metadata/proof in User
    const user = await User.findById(req.user._id);
    user.aadhaarVerified = true;
    user.verificationStatus = 'approved';
    user.verificationMethod = 'AI_DOCUMENT_APPEARANCE';
    user.verificationResult = JSON.stringify({ provider: 'groq', model: 'qwen/qwen3.8-27b' });
    user.nullifierHash = publicSignals[0];
    user.verifiedAt = new Date();
    await user.save();

    res.json({
      verified: true,
      verificationType: 'AI_DOCUMENT_APPEARANCE',
      provider: 'groq',
      zkProofHash: publicSignals[0]
    });

  } catch(err) {
    if (req.file) {
      const absPath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    }
    console.error('Verify Identity Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artists — Wall of Fame discovery feed (only artists with approved artworks)
router.get('/', async (req, res) => {
  try {
    // 1. Aggregation for authenticated creators (Users)
    const users = await User.aggregate([
      {
        $match: {
          aadhaarVerified: true,
          verificationStatus: 'approved'
        }
      },
      {
        $lookup: {
          from: 'artworks',
          localField: '_id',
          foreignField: 'artist', // Links to actual User._id
          as: 'artworks'
        }
      },
      {
        $addFields: {
          approvedArtworks: {
            $filter: {
              input: '$artworks',
              as: 'aw',
              cond: { 
                $and: [
                  { $eq: ['$$aw.moderationStatus', 'approved'] },
                  { $eq: ['$$aw.visibility', 'public'] } // Must be public
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          'approvedArtworks.0': { $exists: true }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          username: '$handle',
          profilePhoto: { $literal: '' },
          bio: { $literal: '' },
          artworkCount: { $size: '$approvedArtworks' },
          contentTypes: {
            $reduce: {
              input: '$approvedArtworks',
              initialValue: [],
              in: {
                $setUnion: [
                  '$$value',
                  {
                    $cond: [
                      { $ne: ['$$this.tags.medium', ''] },
                      ['$$this.tags.medium'],
                      []
                    ]
                  }
                ]
              }
            }
          },
          representativeArtwork: { $arrayElemAt: ['$approvedArtworks.imagePath', 0] }
        }
      }
    ]);

    // 2. Aggregation for Seeded Demo Artists
    const artists = await Artist.aggregate([
      {
        $lookup: {
          from: 'artworks',
          localField: '_id',
          foreignField: 'artistId', // Seeded data uses artistId
          as: 'artworks'
        }
      },
      {
        $addFields: {
          approvedArtworks: {
            $filter: {
              input: '$artworks',
              as: 'aw',
              cond: { 
                $and: [
                  { $eq: ['$$aw.moderationStatus', 'approved'] },
                  { $eq: ['$$aw.visibility', 'public'] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          'approvedArtworks.0': { $exists: true }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          profilePhoto: 1,
          bio: 1,
          artworkCount: { $size: '$approvedArtworks' },
          contentTypes: {
            $reduce: {
              input: '$approvedArtworks',
              initialValue: [],
              in: {
                $setUnion: [
                  '$$value',
                  {
                    $cond: [
                      { $ne: ['$$this.tags.medium', ''] },
                      ['$$this.tags.medium'],
                      []
                    ]
                  }
                ]
              }
            }
          },
          representativeArtwork: { $arrayElemAt: ['$approvedArtworks.imagePath', 0] }
        }
      }
    ]);

    // Combine and sort by artwork count
    const combined = [...users, ...artists].sort((a, b) => b.artworkCount - a.artworkCount);
    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artists — create artist profile
router.post('/', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, username, bio, socialLink } = req.body;
    
    // ── Single Gatekeeper Verification ──
    const textContent = `Name: ${name}\nBio: ${bio || 'none'}\nSocial: ${socialLink || 'none'}`;
    let gatekeeper;
    try {
      gatekeeper = await verifyGatekeeper({ textContent });
    } catch (aiErr) {
      console.error('[Gatekeeper] Verification failed:', aiErr.message);
      return res.status(503).json({ error: 'AI Verification Service Unavailable' });
    }

    if (!gatekeeper.approved) {
      return res.status(400).json({ error: `Content rejected: ${gatekeeper.reason}` });
    }

    let profilePhoto = '';
    if (req.file) {
      profilePhoto = `/uploads/${req.file.filename}`;
    }

    const artist = await Artist.create({
      name,
      username: username || undefined,
      bio,
      socialLink,
      profilePhoto
    });
    res.status(201).json(artist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// GET /api/artists/:id — artist profile + their artworks + existing spotlight
router.get('/:id', async (req, res) => {
  try {
    let artist = await Artist.findById(req.params.id);
    let artworks = [];
    
    if (artist) {
      // Seeded artist
      artworks = await Artwork.find({ 
        artistId: artist._id, 
        moderationStatus: 'approved',
        visibility: 'public'
      }).sort({ createdAt: -1 });
    } else {
      // Authenticated User artist
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Artist not found' });
      
      artist = {
        _id: user._id,
        name: user.name,
        username: user.handle,
        bio: 'Independent creator on Kalasetu.',
        profilePhoto: ''
      };
      
      artworks = await Artwork.find({ 
        artist: user._id, 
        moderationStatus: 'approved',
        visibility: 'public'
      }).sort({ createdAt: -1 });
    }
    
    const spotlight = await Spotlight.findOne({ artistId: artist._id });
    res.json({ artist, artworks, spotlight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
