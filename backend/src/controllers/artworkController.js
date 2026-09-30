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
    const { artistId, artistNote } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });
    if (!artistId) return res.status(400).json({ error: 'artistId is required' });

    const imagePath = `/uploads/${req.file.filename}`;

    // Read image as base64 for AI calls
    const absPath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
    const imageBase64 = fs.readFileSync(absPath, { encoding: 'base64' });

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
    let tags = { medium: '', technique: '', culturalInfluence: '', mood: [] };
    let tagProvider = 'unknown';
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

    const artwork = await Artwork.create({
      artistId,
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
    const filter = { moderationStatus: 'approved' };

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
      const artistIds = matchingArtists.map(a => a._id);

      const searchConditions = [
        { artistNote: searchRegex },
        { 'tags.medium': searchRegex },
        { 'tags.technique': searchRegex },
        { 'tags.culturalInfluence': searchRegex },
        { 'tags.mood': searchRegex },
      ];
      if (artistIds.length > 0) {
        searchConditions.push({ artistId: { $in: artistIds } });
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
      .populate('artistId', 'name')
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

module.exports = { createArtwork, listArtworks, updateArtworkTags };
