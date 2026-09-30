/**
 * India Spotlight Auto-Generator
 *
 * Fires immediately on startup to seed the first post (if DB is empty),
 * then generates a new India culture blog every 2 minutes.
 */
const IndiaSpotlight = require('../models/IndiaSpotlight');
const { generateIndiaSpotlight } = require('../controllers/indiaSpotlightController');

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

async function startIndiaSpotlightScheduler() {
  // Seed 3 posts immediately on first launch so the page isn't empty
  const existing = await IndiaSpotlight.countDocuments();
  if (existing === 0) {
    console.log('[IndiaSpotlight] No posts yet — seeding 3 initial posts…');
    for (let i = 0; i < 3; i++) {
      try {
        await generateIndiaSpotlight(null, null);
        // Small delay between rapid initial generations
        await new Promise(r => setTimeout(r, 3000));
      } catch (e) {
        console.warn('[IndiaSpotlight] Seed post failed:', e.message);
      }
    }
  } else {
    console.log(`[IndiaSpotlight] ${existing} posts already in DB — scheduler starting.`);
  }

  // Generate one new post every 2 minutes
  setInterval(async () => {
    try {
      await generateIndiaSpotlight(null, null);
    } catch (e) {
      console.warn('[IndiaSpotlight] Scheduled generation failed:', e.message);
    }
  }, INTERVAL_MS);

  console.log('[IndiaSpotlight] ✓ Scheduler running — new post every 2 minutes.');
}

module.exports = { startIndiaSpotlightScheduler };
