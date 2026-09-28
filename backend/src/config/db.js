const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hoopscore';
  
  try {
    // Attempt standard connection to MongoDB Atlas or local MongoDB
    console.log(`[DB] Attempting connection to MongoDB: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[DB] Connected successfully to MongoDB at ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to external MongoDB: ${err.message}`);
    console.log('[DB] Launching embedded MongoDB Memory Server for seamless fallback...');
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[DB] Connected successfully to embedded MongoDB instance at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[DB] Critical: Failed to launch embedded MongoDB instance:', memErr.message);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, closeDB };
