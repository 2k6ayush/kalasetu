/**
 * Wikimedia Commons Image Search Service
 *
 * Searches Wikimedia Commons for a photo relevant to an Indian art form.
 * Returns the best-matching image URL.
 * Completely free, no API key required, no strict rate limits!
 */

/**
 * Try one Wikimedia Commons query and return the first photo URL, or null.
 */
async function tryWikimediaQuery(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Kalasetu-India-Blog-Bot/1.0 (https://github.com/ayush/kalasetu)',
      'Accept': 'application/json'
    }
  });
  
  if (!res.ok) return null;
  const data = await res.json();
  
  if (!data.query || !data.query.pages) return null;
  
  // Get the first available image
  const pages = Object.values(data.query.pages);
  const firstImage = pages.find(p => p.imageinfo && p.imageinfo.length > 0);
  
  if (firstImage) {
    return firstImage.imageinfo[0].url;
  }
  return null;
}

/**
 * Main exported function — tries multiple queries with graceful fallback.
 * @param {string} artType  e.g. "Madhubani"
 * @param {string} state    e.g. "Bihar"
 * @returns {Promise<string|null>} image URL or null
 */
async function fetchArtImage(artType, state) {
  // Strip overly generic words so it finds better specific images
  const cleanArt = artType.replace(/\b(Art|Craft|Crafts|Painting|Embroidery|Weaving|Casting)\b/gi, '').trim();
  
  const queries = [
    `${artType}`,
    `${cleanArt} ${state}`,
    `${state} art`
  ];

  for (const q of queries) {
    try {
      const url = await tryWikimediaQuery(q);
      if (url && !url.toLowerCase().endsWith('.svg')) { // Ignore SVGs, prefer real photos/JPGs
        console.log(`[ImageSearch] ✓ Found Wikimedia image for "${artType}" via query: "${q}"`);
        return url;
      }
    } catch (e) {
      // try next query
    }
  }

  console.warn(`[ImageSearch] No image found on Wikimedia for "${artType}" (${state})`);
  return null;
}

module.exports = { fetchArtImage };
