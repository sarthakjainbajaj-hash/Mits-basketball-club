/**
 * HoopScore Super Administrator Bootstrap Script
 * 
 * Safely initializes or verifies the Super Administrator account using server-side configuration.
 * Idempotent: Never overwrites existing credentials if already initialized.
 * 
 * Usage:
 *   node backend/src/scripts/bootstrapSuperAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const bootstrap = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hoopscore';
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@hoopscore.com').toLowerCase().trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Sarthak Bajaj (Owner)';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Bootstrap] Connected to database.');

    let user = await User.findOne({ email: superAdminEmail });

    if (!user) {
      console.log(`[Bootstrap] Creating Super Admin (${superAdminEmail})...`);
      user = await User.create({
        name: superAdminName,
        email: superAdminEmail,
        password: superAdminPassword,
        role: 'superadmin',
        tokenVersion: 0,
      });
      console.log('[Bootstrap] Super Admin successfully created.');
    } else {
      if (user.role !== 'superadmin') {
        user.role = 'superadmin';
        await user.save();
        console.log(`[Bootstrap] Promoted existing account (${superAdminEmail}) to superadmin.`);
      } else {
        console.log(`[Bootstrap] Super Admin account (${superAdminEmail}) is already configured.`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Bootstrap Error]:', err.message);
    process.exit(1);
  }
};

bootstrap();
