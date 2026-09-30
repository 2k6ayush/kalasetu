const router = require('express').Router();
const upload  = require('../middleware/upload');
const { createArtwork, listArtworks, updateArtworkTags, updateVisibility, deleteArtwork, listUserArtworks } = require('../controllers/artworkController');
const { protect } = require('../middleware/auth');

const { aiRateLimiter } = require('../middleware/rateLimiter');
const { validateArtworkInput } = require('../middleware/validate');

// POST /api/artworks — upload + moderate + tag
router.post('/', protect, aiRateLimiter, upload.single('image'), validateArtworkInput, createArtwork);

// GET /api/artworks?medium=x&technique=y&culture=z&mood=m&tag=t
router.get('/', listArtworks);

// GET /api/artworks/me
router.get('/me', protect, listUserArtworks);

// PATCH /api/artworks/:id/tags — update tags after artist review
router.patch('/:id/tags', protect, updateArtworkTags);

// PATCH /api/artworks/:id/visibility — update visibility (public/private)
router.patch('/:id/visibility', protect, updateVisibility);

// DELETE /api/artworks/:id — delete artwork permanently
router.delete('/:id', protect, deleteArtwork);

module.exports = router;
