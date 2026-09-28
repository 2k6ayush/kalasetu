const router = require('express').Router();
const { createSpotlight, listSpotlights, getSpotlight } = require('../controllers/spotlightController');

const { aiRateLimiter } = require('../middleware/rateLimiter');
const { validateSpotlightInput } = require('../middleware/validate');

// POST /api/spotlights/:artistId — generate spotlight for artist
router.post('/:artistId', aiRateLimiter, validateSpotlightInput, createSpotlight);

// GET /api/spotlights — list all
router.get('/', listSpotlights);

// GET /api/spotlights/:id — single spotlight
router.get('/:id', getSpotlight);

module.exports = router;
