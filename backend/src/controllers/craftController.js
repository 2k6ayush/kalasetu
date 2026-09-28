const CraftEntry = require('../models/CraftEntry');
const { generateCraftBreakdown } = require('../services/ai');

/**
 * POST /api/crafts — submit description+images → generate step breakdown → save
 */
async function createCraft(req, res) {
  try {
    const { practitionerName, craftName, region, description, images } = req.body;
    if (!practitionerName || !craftName || !description) {
      return res.status(400).json({ error: 'practitionerName, craftName, and description are required' });
    }

    const { result, provider } = await generateCraftBreakdown(description, images || []);

    const steps = Array.isArray(result.steps) ? result.steps :
                  Array.isArray(result) ? result : [];

    const craft = await CraftEntry.create({
      practitionerName,
      craftName,
      region: region || '',
      description,
      images: images || [],
      steps,
      aiProvider: provider,
    });

    return res.status(201).json(craft);
  } catch (err) {
    console.error('[Craft] createCraft error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/crafts — list all
 */
async function listCrafts(_req, res) {
  try {
    const crafts = await CraftEntry.find().sort({ publishedAt: -1 });
    return res.json(crafts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/crafts/:id — single entry
 */
async function getCraft(req, res) {
  try {
    const craft = await CraftEntry.findById(req.params.id);
    if (!craft) return res.status(404).json({ error: 'Craft entry not found' });
    return res.json(craft);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createCraft, listCrafts, getCraft };
