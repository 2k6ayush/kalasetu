/**
 * Standalone seed runner — delegates to backend/seed.js (single source of truth).
 *
 * Usage:  cd backend && npm run seed
 *   (or)  node seed/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const mongoose = require('mongoose');
const { seedDatabase } = require('../backend/seed');

async function run() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('✗  MONGO_URI is not set in backend/.env.');
    console.error('   Please set a real MongoDB connection string before seeding.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✓  Connected to MongoDB\n');

  await seedDatabase();

  await mongoose.disconnect();
  console.log('✓  Disconnected — seed complete.\n');
  process.exit(0);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
