// backend/src/controllers/exploreController.js
const { geocodePlace } = require('../services/geocodingService');

/**
 * @route   GET /api/v1/explore/geocode?q=place
 * @desc    Geocode a place query
 * @access  Public
 */
exports.geocode = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await geocodePlace(query);

    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'No Indian places found.',
        error: 'Please search for a place within India.' 
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('[ExploreController] Geocode error:', error);
    res.status(500).json({ error: 'Failed to retrieve location data. Please try again.' });
  }
};

const PlaceKnowledge = require('../models/PlaceKnowledge');
const { generatePlaceKnowledge } = require('../services/ai');

/**
 * @route   GET /api/v1/explore/knowledge?name=...&state=...&lat=...&lon=...
 * @desc    Get cultural and travel knowledge for a place using Gemini (with DB caching)
 * @access  Public
 */
exports.getKnowledge = async (req, res) => {
  try {
    const { name, state, lat, lon } = req.query;

    if (!name || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 1. Generate normalized cache key (e.g. hampi-karnataka-india)
    const normalizedName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedState = (state || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cacheKey = `${normalizedName}-${normalizedState}-india`;

    // 2. Check DB cache
    let knowledgeDoc = await PlaceKnowledge.findOne({ cacheKey });
    
    if (knowledgeDoc) {
      return res.status(200).json({ success: true, data: knowledgeDoc.knowledgeData });
    }

    // 3. Not in cache, call Gemini via our AI service layer
    const country = 'India';
    const { result } = await generatePlaceKnowledge(name, state || 'Unknown', country, lat, lon);

    // 4. Save to DB cache
    knowledgeDoc = new PlaceKnowledge({
      cacheKey,
      knowledgeData: result
    });
    await knowledgeDoc.save();

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('[ExploreController] Knowledge error:', error);
    res.status(500).json({ error: 'Detailed information is temporarily unavailable.' });
  }
};

const { fetchEnvironmentData } = require('../services/environmentService');

/**
 * @route   GET /api/v1/explore/environment?lat=...&lon=...
 * @desc    Get factual weather and elevation data
 * @access  Public
 */
exports.getEnvironment = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const data = await fetchEnvironmentData(lat, lon);
    
    // Log any errors that occurred inside fetchEnvironmentData without crashing
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.warn(`[Weather/Elevation] Partial or total failure for lat=${lat}, lon=${lon}:`, data.errors);
    }
    
    // We return 200 even if some APIs failed, as long as the service didn't throw critically.
    // The frontend will handle displaying fallbacks for missing data.
    res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('[ExploreController] Environment error:', error);
    res.status(500).json({ error: 'Environment data is temporarily unavailable.' });
  }
};

const ExploreHistory = require('../models/ExploreHistory');

/**
 * @route   POST /api/v1/explore/history
 * @desc    Save or update a place exploration for the authenticated user
 * @access  Private (requires protect middleware)
 */
exports.saveExploration = async (req, res) => {
  try {
    const userId = req.user._id;
    const { placeName, state, country, lat, lon } = req.body;

    if (!placeName || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required location data' });
    }

    const normalizedName = placeName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedState = (state || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const placeKey = `${normalizedName}-${normalizedState}-${(country || 'india').toLowerCase()}`;

    let history = await ExploreHistory.findOne({ userId, placeKey });

    if (history) {
      history.exploreCount += 1;
      history.lastExploredAt = Date.now();
      await history.save();
    } else {
      history = new ExploreHistory({
        userId,
        placeKey,
        placeName,
        state: state || 'Unknown State',
        country: country || 'India',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });
      await history.save();
    }

    res.status(200).json({ success: true, data: history });

  } catch (error) {
    console.error('[ExploreController] Save history error:', error);
    res.status(500).json({ error: 'Failed to save exploration history.' });
  }
};

/**
 * @route   GET /api/v1/explore/history
 * @desc    Get all explored places for the authenticated user
 * @access  Private
 */
exports.getExplorationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await ExploreHistory.find({ userId }).sort({ lastExploredAt: -1 });
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('[ExploreController] Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch exploration history.' });
  }
};
