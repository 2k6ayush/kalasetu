const router = require('express').Router();
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

const Spotlight = require('../models/Spotlight');

const { validateArtistInput } = require('../middleware/validate');
const { verifyGatekeeper } = require('../services/ai/moderationService');

// POST /api/artists — create artist profile
router.post('/', validateArtistInput, async (req, res) => {
  try {
    const { name, bio, socialLink } = req.body;
    
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

    const artist = await Artist.create(req.body);
    res.status(201).json(artist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/artists/:id — artist profile + their artworks + existing spotlight
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    const artworks = await Artwork.find({ artistId: artist._id, moderationStatus: 'approved' })
      .sort({ createdAt: -1 });
    const spotlight = await Spotlight.findOne({ artistId: artist._id });
    res.json({ artist, artworks, spotlight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
