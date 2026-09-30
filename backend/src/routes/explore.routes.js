// backend/src/routes/explore.routes.js
const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');

// @route   GET /api/v1/explore/geocode?q=place
router.get('/geocode', exploreController.geocode);

// @route   GET /api/v1/explore/knowledge?name=...
router.get('/knowledge', exploreController.getKnowledge);

// @route   GET /api/v1/explore/environment?lat=...&lon=...
router.get('/environment', exploreController.getEnvironment);

const { protect } = require('../middleware/auth');

// @route   POST /api/v1/explore/history
router.post('/history', protect, exploreController.saveExploration);

// @route   GET /api/v1/explore/history
router.get('/history', protect, exploreController.getExplorationHistory);

module.exports = router;
