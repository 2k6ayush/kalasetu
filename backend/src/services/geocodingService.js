// backend/src/services/geocodingService.js

// Simple in-memory cache to prevent repeated geocoding requests for identical searches
const geocodeCache = new Map();

/**
 * Normalizes and fetches coordinates for a given place name using Open-Meteo Geocoding.
 * Validates that the place is strictly within India.
 * Handles ambiguous multiple results by returning all valid Indian matches.
 * 
 * @param {string} query - The place name to search
 * @returns {Array} - Array of matched places: [{ id, name, state, country, latitude, longitude }]
 */
exports.geocodePlace = async (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) {
    throw new Error('Search query is empty');
  }

  // Check Cache
  if (geocodeCache.has(normalizedQuery)) {
    return geocodeCache.get(normalizedQuery);
  }

  try {
    // We use Open-Meteo Geocoding API
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return []; // No results found
    }

    // Filter to strictly ONLY India
    const indianResults = data.results.filter(
      (place) => place.country === 'India' || place.country_code === 'IN'
    );

    if (indianResults.length === 0) {
      return []; // Not in India
    }

    // Normalize results
    const matches = indianResults.map((place) => ({
      id: place.id,
      name: place.name,
      state: place.admin1 || 'Unknown State', // admin1 usually holds the state
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
    }));

    // Deduplicate identical lat/long results (Open-Meteo sometimes returns duplicates)
    const uniqueMatches = [];
    const seenCoords = new Set();
    
    for (const match of matches) {
      const coordKey = `${match.latitude.toFixed(4)}_${match.longitude.toFixed(4)}`;
      if (!seenCoords.has(coordKey)) {
        seenCoords.add(coordKey);
        uniqueMatches.push(match);
      }
    }

    // Cache the result (expire could be added, but a simple map is fine for this project scope)
    geocodeCache.set(normalizedQuery, uniqueMatches);

    return uniqueMatches;

  } catch (error) {
    console.error('[GeocodingService] Error:', error.message);
    throw new Error('Geocoding service unavailable');
  }
};
