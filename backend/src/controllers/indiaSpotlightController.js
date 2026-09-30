/**
 * India Culture Spotlight — controller
 * GET /api/india-spotlights          — list with optional filters
 * GET /api/india-spotlights/:id      — single article
 * POST /api/india-spotlights/generate — internal: generate one new post
 */
const IndiaSpotlight = require('../models/IndiaSpotlight');
const { callAI }     = require('../services/ai');
const { fetchArtImage } = require('../services/imageSearchService');

/**
 * GET /api/india-spotlights
 * Query params: ?state=Bihar  &artType=Madhubani
 */
async function listIndiaSpotlights(req, res) {
  try {
    const filter = {};
    if (req.query.state)   filter.state   = new RegExp(req.query.state.trim(), 'i');
    if (req.query.artType) filter.artType  = new RegExp(req.query.artType.trim(), 'i');

    const spotlights = await IndiaSpotlight.find(filter)
      .sort({ publishedAt: -1 })
      .limit(50);
    return res.json(spotlights);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/india-spotlights/:id
 */
async function getIndiaSpotlight(req, res) {
  try {
    const s = await IndiaSpotlight.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    return res.json(s);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/india-spotlights/generate  (called by the scheduler)
 * Picks a random state + artType combo and generates a blog post.
 */

const INDIAN_STATES = [
  'Rajasthan', 'Gujarat', 'Maharashtra', 'Odisha', 'West Bengal',
  'Kerala', 'Tamil Nadu', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh',
  'Bihar', 'Himachal Pradesh', 'Manipur', 'Assam', 'Andhra Pradesh',
  'Telangana', 'Punjab', 'Uttarakhand', 'Jharkhand', 'Meghalaya',
  'Nagaland', 'Tripura', 'Goa', 'Jammu & Kashmir', 'Chhattisgarh',
];

const ART_TYPES = [
  'Madhubani', 'Warli', 'Pattachitra', 'Kalamkari', 'Miniature Painting',
  'Block Printing', 'Phulkari Embroidery', 'Gond Art', 'Bastar Crafts',
  'Dhokra Metal Casting', 'Bidriware', 'Tanjore Painting', 'Mithila Art',
  'Puppetry', 'Handloom Weaving', 'Pottery', 'Meenakari Jewellery',
  'Stone Carving', 'Bamboo Craft', 'Terracotta Art', 'Thangka Painting',
  'Batik Printing', 'Toda Embroidery', 'Rogan Painting', 'Phad Painting',
];

// State → best-matching art types (for contextually accurate pairings)
const STATE_ART_MAP = {
  'Rajasthan':       ['Miniature Painting', 'Block Printing', 'Meenakari Jewellery', 'Phad Painting', 'Rogan Painting'],
  'Gujarat':         ['Rogan Painting', 'Block Printing', 'Patola Weaving', 'Dhokra Metal Casting'],
  'Maharashtra':     ['Warli', 'Madhubani', 'Bidriware', 'Pottery'],
  'Odisha':          ['Pattachitra', 'Dhokra Metal Casting', 'Stone Carving', 'Handloom Weaving'],
  'West Bengal':     ['Terracotta Art', 'Kantha Embroidery', 'Patachitra', 'Puppetry'],
  'Kerala':          ['Kathakali Costume Art', 'Mural Painting', 'Bamboo Craft', 'Stone Carving'],
  'Tamil Nadu':      ['Tanjore Painting', 'Kalamkari', 'Stone Carving', 'Handloom Weaving'],
  'Karnataka':       ['Bidriware', 'Kalamkari', 'Channapatna Toys', 'Lambani Embroidery'],
  'Madhya Pradesh':  ['Gond Art', 'Bastar Crafts', 'Dhokra Metal Casting', 'Batik Printing'],
  'Uttar Pradesh':   ['Meenakari Jewellery', 'Chikankari Embroidery', 'Block Printing', 'Pottery'],
  'Bihar':           ['Madhubani', 'Mithila Art', 'Terracotta Art', 'Sujni Embroidery'],
  'Himachal Pradesh':['Thangka Painting', 'Kullu Shawl Weaving', 'Wood Carving', 'Pottery'],
  'Manipur':         ['Handloom Weaving', 'Pottery', 'Bamboo Craft', 'Traditional Dance Costume'],
  'Assam':           ['Handloom Weaving', 'Cane & Bamboo Craft', 'Pottery', 'Mask Making'],
  'Andhra Pradesh':  ['Kalamkari', 'Nirmal Painting', 'Bidriware', 'Handloom Weaving'],
  'Telangana':       ['Bidriware', 'Kalamkari', 'Nirmal Painting', 'Pottery'],
  'Punjab':          ['Phulkari Embroidery', 'Jutti Making', 'Pottery', 'Copper Craft'],
  'Uttarakhand':     ['Thangka Painting', 'Wood Carving', 'Bamboo Craft', 'Aipan Art'],
  'Jharkhand':       ['Sohrai Painting', 'Dhokra Metal Casting', 'Sabai Grass Weaving', 'Tribal Jewellery'],
  'Meghalaya':       ['Bamboo Craft', 'Cane Weaving', 'Handloom Weaving', 'Dok Rumal'],
  'Nagaland':        ['Tribal Weaving', 'Wood Carving', 'Bamboo Craft', 'Beadwork'],
  'Tripura':         ['Bamboo Craft', 'Handloom Weaving', 'Cane Craft', 'Terracotta Art'],
  'Goa':             ['Azulejo Tile Art', 'Kunbi Weaving', 'Pottery', 'Cashew Shell Craft'],
  'Jammu & Kashmir': ['Pashmina Weaving', 'Papier-Mâché', 'Wood Carving', 'Carpet Weaving'],
  'Chhattisgarh':    ['Bastar Dhokra', 'Godna Tribal Tattoo Art', 'Bamboo Craft', 'Pottery'],
};

let lastUsedIdx = -1;

async function generateIndiaSpotlight(req, res) {
  try {
    // Pick state round-robin to ensure variety
    lastUsedIdx = (lastUsedIdx + 1) % INDIAN_STATES.length;
    const state = INDIAN_STATES[lastUsedIdx];
    const artPool = STATE_ART_MAP[state] || ART_TYPES;
    const artType = artPool[Math.floor(Math.random() * artPool.length)];

    const systemPrompt = `You are a cultural journalist writing a passionate, magazine-quality blog post about the traditional arts of India. Write a 200–280 word editorial feature about "${artType}" from ${state}, India. Cover:
- The cultural history and significance of this art form
- How it is practiced and what makes it unique
- Why it is endangered or being preserved today
- A specific detail or practitioner story that brings it to life
Return JSON exactly: {"title": string, "body": string}
The title should be vivid and specific. The body should be warm, immersive, and respectful of the tradition.`;

    const userContent = `Write a cultural blog post about ${artType} from ${state}, India.`;

    // Run AI generation and image search in parallel for speed
    const [aiRes, imageUrl] = await Promise.all([
      callAI({ task: 'india-spotlight', systemPrompt, userContent }),
      fetchArtImage(artType, state),
    ]);

    const { result, provider } = aiRes;
    const title = typeof result === 'object' ? result.title : `${artType}: A Hidden Treasure of ${state}`;
    const body  = typeof result === 'object' ? result.body  : (typeof result === 'string' ? result : JSON.stringify(result));

    const spotlight = await IndiaSpotlight.create({
      title, body, artType, state,
      imageUrl: imageUrl || null,
      aiProvider: provider,
    });
    console.log(`[IndiaSpotlight] ✓ Generated: "${title}" | Image: ${imageUrl ? 'found' : 'none'} (${state} · ${artType})`);

    if (res) return res.status(201).json(spotlight);
    return spotlight;
  } catch (err) {
    console.error('[IndiaSpotlight] Generation error:', err.message);
    if (res) return res.status(500).json({ error: err.message });
    throw err;
  }
}

/**
 * GET /api/india-spotlights/meta — returns available states and artTypes for filter dropdowns
 */
async function getIndiaSpotlightMeta(_req, res) {
  try {
    const states   = await IndiaSpotlight.distinct('state');
    const artTypes = await IndiaSpotlight.distinct('artType');
    return res.json({
      states:   [...new Set([...states,   ...INDIAN_STATES])].sort(),
      artTypes: [...new Set([...artTypes, ...ART_TYPES])].sort(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/india-spotlights/backfill-images
 * Retroactively fetches images for all posts that don’t have one yet.
 * Call this once after adding PEXELS_API_KEY to .env.
 */
async function backfillImages(req, res) {
  try {
    const posts = await IndiaSpotlight.find({ imageUrl: null });
    let filled = 0;
    for (const post of posts) {
      const imageUrl = await fetchArtImage(post.artType, post.state);
      if (imageUrl) {
        post.imageUrl = imageUrl;
        await post.save();
        filled++;
      }
      // Rate limit: 200 req/hr = ~3.3/min, 1 every 500ms is safe
      await new Promise(r => setTimeout(r, 500));
    }
    return res.json({ message: `Backfilled ${filled} of ${posts.length} posts.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listIndiaSpotlights,
  getIndiaSpotlight,
  generateIndiaSpotlight,
  getIndiaSpotlightMeta,
  backfillImages,
  INDIAN_STATES,
  ART_TYPES,
};
