const Spotlight = require('../models/Spotlight');
const Artist    = require('../models/Artist');
const Artwork   = require('../models/Artwork');
const { writeSpotlight } = require('../services/ai');

/**
 * POST /api/spotlights/:artistId — generate + save spotlight
 */
async function createSpotlight(req, res) {
  try {
    const artist = await Artist.findById(req.params.artistId);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    // Check if spotlight already exists for this artist
    const existing = await Spotlight.findOne({ artistId: artist._id });
    if (existing) {
      return res.status(200).json(existing);
    }

    // Gather their technique tags for context
    const artworks = await Artwork.find({
      artistId: artist._id,
      moderationStatus: 'approved',
    }).limit(5);

    const techniques = [...new Set(artworks.map(a => a.tags?.technique).filter(Boolean))];

    const profile = {
      name: artist.name,
      bio: artist.bio,
      techniqueTags: techniques,
      artistNote: artworks[0]?.artistNote || '',
    };

    const { result, provider } = await writeSpotlight(profile);

    const spotlight = await Spotlight.create({
      artistId: artist._id,
      title: result.title || `Spotlight: ${artist.name}`,
      body: result.body || (typeof result === 'string' ? result : JSON.stringify(result)),
      aiProvider: provider,
    });

    return res.status(201).json(spotlight);
  } catch (err) {
    console.error('[Spotlight] createSpotlight error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/spotlights — list all
 */
async function listSpotlights(_req, res) {
  try {
    const spotlights = await Spotlight.find()
      .populate('artistId', 'name')
      .sort({ publishedAt: -1 });
    return res.json(spotlights);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/spotlights/:id — single spotlight
 */
async function getSpotlight(req, res) {
  try {
    const spotlight = await Spotlight.findById(req.params.id)
      .populate('artistId', 'name bio socialLink');
    if (!spotlight) return res.status(404).json({ error: 'Spotlight not found' });
    return res.json(spotlight);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createSpotlight, listSpotlights, getSpotlight };
