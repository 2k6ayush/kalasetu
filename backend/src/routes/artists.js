const router = require('express').Router();
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

const Spotlight = require('../models/Spotlight');

const { validateArtistInput } = require('../middleware/validate');
const { verifyGatekeeper } = require('../services/ai/moderationService');
const upload = require('../middleware/upload');

// GET /api/artists — Wall of Fame discovery feed (only artists with approved artworks)
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.aggregate([
      {
        $lookup: {
          from: 'artworks',
          localField: '_id',
          foreignField: 'artistId',
          as: 'artworks'
        }
      },
      {
        $addFields: {
          approvedArtworks: {
            $filter: {
              input: '$artworks',
              as: 'aw',
              cond: { $eq: ['$$aw.moderationStatus', 'approved'] }
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
      },
      { $sort: { artworkCount: -1 } }
    ]);
    res.json(artists);
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
