require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('../seed');
const { startIndiaSpotlightScheduler } = require('./services/indiaSpotlightScheduler');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/artists',          require('./routes/artists'));
app.use('/api/artworks',         require('./routes/artworks'));
app.use('/api/spotlights',       require('./routes/spotlights'));
app.use('/api/crafts',           require('./routes/crafts'));
app.use('/api/india-spotlights', require('./routes/indiaSpotlights'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Auto-seed with demo data if DB is empty
  await seedDatabase();

  // Start India culture blog auto-generator (every 2 min)
  startIndiaSpotlightScheduler();

  app.listen(PORT, () => {
    console.log(`\n🎨  Kalāsetu backend running → http://localhost:${PORT}\n`);
  });
});

module.exports = app;
