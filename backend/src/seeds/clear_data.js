const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');

const clearDummyData = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hoopscore';

  try {
    console.log(`[Clear] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Clear] Connected to database.');

    console.log('[Clear] Purging all dummy data...');
    const delEvents = await MatchEvent.deleteMany({});
    const delMatches = await Match.deleteMany({});
    const delTournaments = await Tournament.deleteMany({});
    const delPlayers = await Player.deleteMany({});
    const delTeams = await Team.deleteMany({});

    console.log(`✅ Removed ${delMatches.deletedCount} matches`);
    console.log(`✅ Removed ${delEvents.deletedCount} match events`);
    console.log(`✅ Removed ${delTournaments.deletedCount} tournaments`);
    console.log(`✅ Removed ${delPlayers.deletedCount} players`);
    console.log(`✅ Removed ${delTeams.deletedCount} teams`);

    // Ensure default authentication users are present so the user can log in
    let admin = await User.findOne({ email: 'admin@hoopscore.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Sarthak Bajaj',
        email: 'admin@hoopscore.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Created default Admin user: admin@hoopscore.com');
    } else {
      console.log('ℹ️ Admin user already exists: admin@hoopscore.com');
    }

    let scorer = await User.findOne({ email: 'scorer@hoopscore.com' });
    if (!scorer) {
      scorer = await User.create({
        name: 'Dave Miller (Official Scorer)',
        email: 'scorer@hoopscore.com',
        password: 'scorer123',
        role: 'scorer',
      });
      console.log('✅ Created default Scorer user: scorer@hoopscore.com');
    } else {
      console.log('ℹ️ Scorer user already exists: scorer@hoopscore.com');
    }

    let viewer = await User.findOne({ email: 'viewer@hoopscore.com' });
    if (!viewer) {
      viewer = await User.create({
        name: 'Sam Wilson (Viewer)',
        email: 'viewer@hoopscore.com',
        password: 'viewer123',
        role: 'viewer',
      });
      console.log('✅ Created default Viewer user: viewer@hoopscore.com');
    } else {
      console.log('ℹ️ Viewer user already exists: viewer@hoopscore.com');
    }

    console.log('==================================================');
    console.log('🧹 ALL DUMMY DATA HAS BEEN REMOVED SUCCESSFULLY!');
    console.log('The database is now completely clean and ready for custom data.');
    console.log('==================================================');
    console.log('Active Login Accounts:');
    console.log('  Admin:  admin@hoopscore.com  / admin123');
    console.log('  Scorer: scorer@hoopscore.com / scorer123');
    console.log('  Viewer: viewer@hoopscore.com / viewer123');
    console.log('==================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    process.exit(1);
  }
};

clearDummyData();
