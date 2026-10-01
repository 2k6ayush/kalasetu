const fs = require('fs');
const path = require('path');
const Artwork = require('../models/Artwork');
const Artist = require('../models/Artist');
const { tagArtwork } = require('../services/ai');
const { verifyGatekeeper } = require('../services/ai/moderationService');
/**
 * POST /api/artworks — upload image → moderate → if safe, tag → save
 */
async function createArtwork(req, res) {
  try {
    const { artistNote, title, type = 'IMAGE' } = req.body;
    if (type !== 'TEXT' && !req.file) return res.status(400).json({ error: 'Media file is required' });
    
    // artist is now retrieved from the JWT token
    const artist = req.user._id;

    let imagePath = '';
    let absPath = '';
    let imageBase64 = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
      absPath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
    }

    let tags = { medium: '', technique: '', culturalInfluence: '', mood: [] };
    let tagProvider = 'unknown';

    // ── ONLY VERIFY/TAG IMAGES ──
    if (type === 'IMAGE' && absPath) {
      imageBase64 = fs.readFileSync(absPath, { encoding: 'base64' });

      // ── Single Gatekeeper Verification ──
    try {
      const gatekeeper = await verifyGatekeeper({ imageBase64, textContent: artistNote });
      if (!gatekeeper.approved) {
        // Cleanup temp file
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        return res.status(200).json({
          moderation: 'rejected',
          reason: gatekeeper.reason
        });
      }
    } catch (aiErr) {
      console.error('[Gatekeeper] Verification failed:', aiErr.message);
      // Cleanup temp file and fail-closed
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      return res.status(503).json({ error: 'AI Verification Service Unavailable' });
    }

      // ── Step 2: Auto-tag ──
      try {
        const tagRes = await tagArtwork(imageBase64);
        tagProvider = tagRes.provider;
        const t = tagRes.result;
        tags = {
          medium: t.medium || '',
          technique: t.technique || '',
          culturalInfluence: t.cultural_influence || '',
          mood: Array.isArray(t.mood) ? t.mood : [],
        };
      } catch (aiErr) {
        console.warn('[Artwork] AI tagging unavailable:', aiErr.message);
      }
    }

    const artwork = await Artwork.create({
      artist,
      type,
      title: title || '',
      imagePath,
      artistNote: artistNote || '',
      tags,
      moderationStatus: 'approved',
      moderationReason: 'Approved',
      aiProvider: tagProvider,
    });

    return res.status(201).json({
      moderation: 'approved',
      tags,
      artwork,
    });
  } catch (err) {
    console.error('[Artwork] createArtwork error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/artworks?medium=x&technique=y&culture=z
 * Browse/filter artworks — NO sort-by-popularity.
 */
async function listArtworks(req, res) {
  try {
    const filter = { moderationStatus: 'approved', visibility: 'public' };

    if (req.query.medium)    filter['tags.medium']            = new RegExp(req.query.medium, 'i');
    if (req.query.technique) filter['tags.technique']         = new RegExp(req.query.technique, 'i');
    if (req.query.culture)   filter['tags.culturalInfluence'] = new RegExp(req.query.culture, 'i');
    if (req.query.mood)      filter['tags.mood']              = new RegExp(req.query.mood, 'i');
    if (req.query.tag) {
      const tagRegex = new RegExp(req.query.tag, 'i');
      filter.$or = [
        { 'tags.medium': tagRegex },
        { 'tags.technique': tagRegex },
        { 'tags.culturalInfluence': tagRegex },
        { 'tags.mood': tagRegex },
      ];
    }

    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      
      const matchingArtists = await Artist.find({ name: searchRegex }).select('_id');
      const matchingUsers = await require('../models/User').find({ name: searchRegex }).select('_id');
      
      const artistIds = [
        ...matchingArtists.map(a => a._id),
        ...matchingUsers.map(u => u._id)
      ];

      const searchConditions = [
        { artistNote: searchRegex },
        { 'tags.medium': searchRegex },
        { 'tags.technique': searchRegex },
        { 'tags.culturalInfluence': searchRegex },
        { 'tags.mood': searchRegex },
      ];
      if (artistIds.length > 0) {
        searchConditions.push({ artist: { $in: artistIds } });
        searchConditions.push({ artistId: { $in: artistIds } }); // Support seeded data which uses artistId
      }

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchConditions },
        ];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    let artworks = await Artwork.find(filter)
      .populate('artist', 'name handle')
      .sort({ createdAt: -1 });

    if (req.query.shuffle === 'true') {
      // Fisher-Yates shuffle for equal shelf space (NO popularity rank)
      for (let i = artworks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [artworks[i], artworks[j]] = [artworks[j], artworks[i]];
      }
    }

    return res.json(artworks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /api/artworks/:id/tags — update artwork tags after artist review
 */
async function updateArtworkTags(req, res) {
  try {
    const { medium, technique, culturalInfluence, mood } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ error: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });

    artwork.tags = {
      medium: medium !== undefined ? medium : artwork.tags.medium,
      technique: technique !== undefined ? technique : artwork.tags.technique,
      culturalInfluence: culturalInfluence !== undefined ? culturalInfluence : artwork.tags.culturalInfluence,
      mood: Array.isArray(mood) ? mood : (typeof mood === 'string' ? mood.split(',').map(s => s.trim()).filter(Boolean) : artwork.tags.mood),
    };

    await artwork.save();
    return res.json(artwork);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /api/artworks/:id/visibility
 */
async function updateVisibility(req, res) {
  try {
    const { visibility } = req.body;
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility status' });
    }
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ error: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });

    artwork.visibility = visibility;
    await artwork.save();
    return res.json(artwork);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/artworks/:id
 */
async function deleteArtwork(req, res) {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ error: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });

    if (artwork.imagePath) {
      const filename = artwork.imagePath.split('/').pop();
      const absPath = path.join(__dirname, '..', '..', 'uploads', filename);
      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    }

    await Artwork.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Artwork deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/artworks/me
 */
async function listUserArtworks(req, res) {
  try {
    const artworks = await Artwork.find({ artist: req.user._id })
      .sort({ createdAt: -1 });
    return res.json(artworks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createArtwork, listArtworks, updateArtworkTags, updateVisibility, deleteArtwork, listUserArtworks };
