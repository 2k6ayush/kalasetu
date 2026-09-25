const router = require('express').Router();
const { createSpotlight, listSpotlights, getSpotlight } = require('../controllers/spotlightController');

// POST /api/spotlights/:artistId — generate spotlight for artist
router.post('/:artistId', createSpotlight);

// GET /api/spotlights — list all
router.get('/', listSpotlights);

// GET /api/spotlights/:id — single spotlight
router.get('/:id', getSpotlight);

module.exports = router;
