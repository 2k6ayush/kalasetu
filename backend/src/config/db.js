const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('⚠  No MONGO_URI found — starting in-memory MongoDB for dev…');
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    uri = mongoServer.getUri();
    console.log(`✓  In-memory MongoDB running at ${uri}`);
  }

  try {
    await mongoose.connect(uri);
    console.log('✓  MongoDB connected');
  } catch (err) {
    console.error('✗  MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
