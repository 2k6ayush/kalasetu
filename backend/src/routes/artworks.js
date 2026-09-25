const router = require('express').Router();
const upload  = require('../middleware/upload');
const { createArtwork, listArtworks } = require('../controllers/artworkController');

// POST /api/artworks — upload + moderate + tag
router.post('/', upload.single('image'), createArtwork);

// GET /api/artworks?medium=x&technique=y&culture=z&mood=m&tag=t
router.get('/', listArtworks);

module.exports = router;
