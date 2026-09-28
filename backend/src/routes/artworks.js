const router = require('express').Router();
const upload  = require('../middleware/upload');
const { createArtwork, listArtworks, updateArtworkTags } = require('../controllers/artworkController');

const { aiRateLimiter } = require('../middleware/rateLimiter');
const { validateArtworkInput } = require('../middleware/validate');

// POST /api/artworks — upload + moderate + tag
router.post('/', aiRateLimiter, upload.single('image'), validateArtworkInput, createArtwork);

// GET /api/artworks?medium=x&technique=y&culture=z&mood=m&tag=t
router.get('/', listArtworks);

// PATCH /api/artworks/:id/tags — update tags after artist review
router.patch('/:id/tags', updateArtworkTags);

module.exports = router;
