require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('../seed');
const { startIndiaSpotlightScheduler } = require('./services/indiaSpotlightScheduler');

const fs = require('fs');

const app = express();

// ── Validate ZK Artifacts on Startup ──
const validateZK = () => {
  const wasmPath = path.resolve(__dirname, '../../zk/identity_js/identity.wasm');
  const zkeyPath = path.resolve(__dirname, '../../zk/identity_final.zkey');
  const vkeyPath = path.resolve(__dirname, 'config/verification_key.json');

  [
    { name: 'identity.wasm', path: wasmPath },
    { name: 'identity_final.zkey', path: zkeyPath },
    { name: 'verification_key.json', path: vkeyPath }
  ].forEach(artifact => {
    if (!fs.existsSync(artifact.path)) {
      console.error(`\n❌ [ZK ERROR] Missing required artifact: ${artifact.name}`);
      console.error(`   Expected location: ${artifact.path}\n`);
    } else {
      console.log(`✓ ZK Artifact found: ${artifact.name}`);
    }
  });
};
validateZK();

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
app.use('/api/explore',          require('./routes/explore.routes'));

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
