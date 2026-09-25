const fs = require('fs');
const path = require('path');
const Artwork = require('../models/Artwork');
const { moderateContent, tagArtwork } = require('../services/ai');

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

    // ── Step 1: Content moderation ──
    let modResult, modProvider;
    try {
      const mod = await moderateContent(imageBase64, artistNote);
      modResult = mod.result;
      modProvider = mod.provider;
    } catch (aiErr) {
      // If AI moderation fails entirely, let the artwork through with a note
      console.warn('[Artwork] AI moderation unavailable:', aiErr.message);
      modResult = { safe: true, reason: 'Moderation service unavailable — approved by default' };
      modProvider = 'none';
    }

    if (!modResult.safe) {
      // Rejected — save record but mark as rejected
      const artwork = await Artwork.create({
        artistId,
        imagePath,
        artistNote: artistNote || '',
        moderationStatus: 'rejected',
        moderationReason: modResult.reason,
        aiProvider: modProvider,
      });
      return res.status(200).json({
        moderation: 'rejected',
        reason: modResult.reason,
        artwork,
      });
    }

    // ── Step 2: Auto-tag ──
    let tags = { medium: '', technique: '', culturalInfluence: '', mood: [] };
    let tagProvider = modProvider;
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
      moderationReason: modResult.reason || 'Approved',
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

    // Sort by newest — NO popularity/engagement sort
    const artworks = await Artwork.find(filter)
      .populate('artistId', 'name')
      .sort({ createdAt: -1 });

    return res.json(artworks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createArtwork, listArtworks };
