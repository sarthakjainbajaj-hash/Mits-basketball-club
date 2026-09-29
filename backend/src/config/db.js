const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const seedInitialUsers = async () => {
  try {
    const User = require('../models/User');
    let admin = await User.findOne({ email: 'admin@hoopscore.com' });
    if (!admin) {
      console.log('[DB] Seeding default Admin user (Sarthak Bajaj)...');
      await User.create({
        name: 'Sarthak Bajaj',
        email: 'admin@hoopscore.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('[DB] Default Admin user created: admin@hoopscore.com / admin123');
    } else if (admin.name !== 'Sarthak Bajaj') {
      admin.name = 'Sarthak Bajaj';
      await admin.save();
      console.log('[DB] Admin user updated to Sarthak Bajaj');
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
