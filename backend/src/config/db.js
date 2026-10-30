const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const seedInitialUsers = async () => {
  try {
    const User = require('../models/User');
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@hoopscore.com').toLowerCase();

    let owner = await User.findOne({ email: superAdminEmail });
    if (!owner) {
      console.log(`[DB Security] Initializing Super Admin owner (${superAdminEmail})...`);
      await User.create({
        name: 'Sarthak Bajaj (Owner)',
        email: superAdminEmail,
        password: process.env.SUPER_ADMIN_PASSWORD || 'admin123',
        role: 'superadmin',
        tokenVersion: 0,
      });
      console.log(`[DB Security] Super Admin account created.`);
    } else {
      let needsSave = false;
      if (owner.role !== 'superadmin') {
        owner.role = 'superadmin';
        needsSave = true;
      }
      if (needsSave) {
        await owner.save();
        console.log(`[DB Security] Super Admin role verified for owner (${superAdminEmail}).`);
      }
    }

    let scorer = await User.findOne({ email: 'scorer@hoopscore.com' });
    if (!scorer) {
      await User.create({
        name: 'Dave Miller (Official Scorer)',
        email: 'scorer@hoopscore.com',
        password: 'scorer123',
        role: 'scorer',
      });
      console.log('[DB] Default Scorer user created: scorer@hoopscore.com / scorer123');
    }

    let viewer = await User.findOne({ email: 'viewer@hoopscore.com' });
    if (!viewer) {
      await User.create({
        name: 'Sam Wilson (Viewer)',
        email: 'viewer@hoopscore.com',
        password: 'viewer123',
        role: 'viewer',
      });
      console.log('[DB] Default Viewer user created: viewer@hoopscore.com / viewer123');
    }
  } catch (err) {
    console.warn('[DB] Warning during initial users check:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (uri) {
    const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`[DB] Attempting connection to MongoDB: ${sanitizedUri}`);
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 30,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
      });
      console.log(`[DB] Connected successfully to external MongoDB at ${mongoose.connection.host}`);
      await seedInitialUsers();
      return;
    } catch (err) {
      console.warn(`[DB] External MongoDB connection failed (${err.message}).`);
    }
  } else {
    console.warn('[DB] Neither MONGODB_URI nor MONGO_URI is set.');
  }

  // Attempt local connection if in local dev
  const localUri = 'mongodb://127.0.0.1:27017/hoopscore';
  try {
    console.log(`[DB] Attempting local MongoDB connection: ${localUri}`);
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DB] Connected successfully to local MongoDB at ${mongoose.connection.host}`);
    await seedInitialUsers();
    return;
  } catch (localErr) {
    console.warn(`[DB] Local MongoDB connection failed: ${localErr.message}`);
  }

  // Fallback to embedded in-memory MongoDB
  console.log('[DB] Launching embedded MongoDB Memory Server for seamless fallback...');
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(inMemoryUri);
    console.log(`[DB] Connected successfully to embedded MongoDB instance at ${inMemoryUri}`);
    await seedInitialUsers();
  } catch (memErr) {
    console.error('[DB] Critical: Failed to launch embedded MongoDB instance:', memErr.message);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, closeDB };
