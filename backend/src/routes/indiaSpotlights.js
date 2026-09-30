const router = require('express').Router();
const {
  listIndiaSpotlights,
  getIndiaSpotlight,
  generateIndiaSpotlight,
  getIndiaSpotlightMeta,
  backfillImages,
} = require('../controllers/indiaSpotlightController');

// GET  /api/india-spotlights/meta
router.get('/meta', getIndiaSpotlightMeta);

// POST /api/india-spotlights/generate  — manually trigger one generation
router.post('/generate', generateIndiaSpotlight);

// POST /api/india-spotlights/backfill-images — add images to existing posts
router.post('/backfill-images', backfillImages);

// GET  /api/india-spotlights
router.get('/', listIndiaSpotlights);

// GET  /api/india-spotlights/:id
router.get('/:id', getIndiaSpotlight);

module.exports = router;
