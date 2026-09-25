const router = require('express').Router();
const { createCraft, listCrafts, getCraft } = require('../controllers/craftController');

// POST /api/crafts — submit + generate breakdown
router.post('/', createCraft);

// GET /api/crafts — list all
router.get('/', listCrafts);

// GET /api/crafts/:id — single entry
router.get('/:id', getCraft);

module.exports = router;
