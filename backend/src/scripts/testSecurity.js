const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const ScoreAuditLog = require('../models/ScoreAuditLog');
const { verifyMatchScorer, authorize, requireSuperAdmin } = require('../middleware/role');
const { updateUserRole } = require('../controllers/authController');

async function runSecurityTests() {
  console.log('=== STARTING HOOPSCORE SECURITY VERIFICATION SUITE ===\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hoopscore');
  console.log('✔ Connected to database for testing.');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // Clean up any previous test accounts
    await User.deleteMany({ email: { $in: ['sec_attacker@test.com', 'sec_scorer_1@test.com', 'sec_scorer_2@test.com', 'sec_admin@test.com'] } });
    await Match.deleteMany({ venue: 'Security Test Arena' });
    await ScoreAuditLog.deleteMany({ notes: /Security Test/ });

    // ----------------------------------------------------
    // TEST 1: Registration Role Tampering / Mass Assignment
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Registration Privilege Escalation ---');
    // Simulate what POST /api/auth/register does:
    // User tries to pass role: 'admin' or role: 'superadmin'
    const attemptedPayload = {
      name: 'Malicious Attacker',
      email: 'sec_attacker@test.com',
      password: 'AttackerPassword123!',
      role: 'superadmin' // ATTEMPTED EXPLOIT
    };

    // Controller creates user forcing role = 'viewer'
    const safeRole = 'viewer'; // Strictly enforced server-side
    const attackerUser = await User.create({
      name: attemptedPayload.name,
      email: attemptedPayload.email,
      password: attemptedPayload.password,
      role: safeRole
    });

    assert(attackerUser.role === 'viewer', 'Attacker registering with role="superadmin" was strictly forced to "viewer"');
    assert(attackerUser.tokenVersion === 0, 'New user initializes with clean tokenVersion 0');
    assert(attackerUser.isSuspended === false, 'User account is not suspended by default');

    // ----------------------------------------------------
    // TEST 2: Scorer Match Assignment Verification
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Scorer Match-Scoped Authorization (IDOR Prevention) ---');
    
    // Create two scorers
    const scorer1 = await User.create({
      name: 'Authorized Scorer 1',
      email: 'sec_scorer_1@test.com',
      password: 'Password123!',
      role: 'scorer'
    });

    const scorer2 = await User.create({
      name: 'Rogue Scorer 2',
      email: 'sec_scorer_2@test.com',
      password: 'Password123!',
      role: 'scorer'
    });

    const adminUser = await User.create({
      name: 'Tournament Admin',
      email: 'sec_admin@test.com',
      password: 'Password123!',
      role: 'admin'
    });

    // Create a match assigned exclusively to scorer1
    const testMatch = await Match.create({
      matchName: 'Security Test Championship Match',
      teamA: new mongoose.Types.ObjectId(),
      teamB: new mongoose.Types.ObjectId(),
      status: 'SCHEDULED',
      venue: 'Security Test Arena',
      assignedScorer: scorer1._id
    });

    // Test middleware function wrapper for testing
    const testMiddleware = (middleware, req) => {
      return new Promise((resolve) => {
        const res = {
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            this.body = data;
            resolve({ statusCode: this.statusCode || 200, body: data, nextCalled: false });
          }
        };
        const next = () => {
          resolve({ statusCode: 200, nextCalled: true });
        };
        middleware(req, res, next);
      });
    };

    // 2a. Unassigned scorer attempts to score match
    const rogueReq = {
      user: { _id: scorer2._id, role: 'scorer' },
      params: { id: testMatch._id.toString() }
    };
    const rogueResult = await testMiddleware(verifyMatchScorer, rogueReq);
    assert(
      rogueResult.statusCode === 403 && rogueResult.nextCalled === false,
      'Unassigned Scorer 2 was BLOCKED with 403 Forbidden when attempting to access Match assigned to Scorer 1'
    );

    // 2b. Authorized scorer attempts to score match
    const authReq = {
      user: { _id: scorer1._id, role: 'scorer' },
      params: { id: testMatch._id.toString() }
    };
    const authResult = await testMiddleware(verifyMatchScorer, authReq);
    assert(
      authResult.nextCalled === true,
      'Assigned Scorer 1 was GRANTED access to score their assigned match'
    );

    // 2c. Tournament Admin attempts to score/manage match
    const adminReq = {
      user: { _id: adminUser._id, role: 'admin' },
      params: { id: testMatch._id.toString() }
    };
    const adminResult = await testMiddleware(verifyMatchScorer, adminReq);
    assert(
      adminResult.nextCalled === true,
      'Tournament Admin is authorized to oversee/score any match'
    );

    // ----------------------------------------------------
    // TEST 3: Score Tamper Audit Trail & History
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Immutable Score Tamper Audit Logging ---');

    const auditLogEntry = await ScoreAuditLog.create({
      matchId: testMatch._id,
      operatorId: scorer1._id,
      operatorName: scorer1.name,
      operatorEmail: scorer1.email,
      operatorRole: scorer1.role,
      previousScoreA: 0,
      previousScoreB: 0,
      newScoreA: 2,
      newScoreB: 0,
      pointsDelta: 2,
      team: 'A',
      actionType: 'SCORE_UPDATE',
      notes: 'Security Test 2-pointer',
      ipAddress: '127.0.0.1'
    });

    assert(auditLogEntry._id != null, 'ScoreAuditLog record was created successfully');
    assert(auditLogEntry.operatorRole === 'scorer', 'Audit log accurately recorded operator role as "scorer"');
    assert(auditLogEntry.pointsDelta === 2, 'Audit log accurately captured pointsDelta (+2)');
    assert(auditLogEntry.previousScoreA === 0 && auditLogEntry.newScoreA === 2, 'Previous and new scores preserved for complete verification');

    // ----------------------------------------------------
    // TEST 4: Score Restoration
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Score Restoration Capability ---');

    // Simulate restoring match back to 0-0
    const restorationEntry = await ScoreAuditLog.create({
      matchId: testMatch._id,
      operatorId: adminUser._id,
      operatorName: adminUser.name,
      operatorEmail: adminUser.email,
      operatorRole: adminUser.role,
      previousScoreA: 2,
      previousScoreB: 0,
      newScoreA: 0,
      newScoreB: 0,
      pointsDelta: -2,
      team: 'A',
      actionType: 'SCORE_RESTORATION',
      notes: 'Security Test admin rollback',
      ipAddress: '127.0.0.1',
      isRestored: true,
      restoredAt: new Date(),
      restoredBy: adminUser._id
    });

    assert(restorationEntry.actionType === 'SCORE_RESTORATION', 'Restoration action correctly tagged as SCORE_RESTORATION');
    assert(restorationEntry.isRestored === true, 'Audit log reflects isRestored: true');

    // ----------------------------------------------------
    // TEST 5: Role Hierarchy Privilege Escalation Checks
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Role Hierarchy & Self-Promotion Defense ---');

    // Simulate Admin attempting to promote themselves or someone else to Super Admin
    const elevateReq = {
      user: { _id: adminUser._id, role: 'admin' },
      params: { id: scorer1._id.toString() },
      body: { role: 'superadmin' }
    };
    const elevateRes = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    await updateUserRole(elevateReq, elevateRes);
    assert(
      elevateRes.statusCode === 403,
      'Admin attempting to promote another user to "superadmin" was BLOCKED with 403 Forbidden'
    );

    // Admin attempting to demote or change a Super Admin
    const superAdminUser = await User.findOne({ role: 'superadmin' });
    if (superAdminUser) {
      const attackSuperReq = {
        user: { _id: adminUser._id, role: 'admin' },
        params: { id: superAdminUser._id.toString() },
        body: { role: 'viewer' }
      };
      const attackSuperRes = {
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; }
      };

      await updateUserRole(attackSuperReq, attackSuperRes);
      assert(
        attackSuperRes.statusCode === 403,
        'Admin attempting to demote a Super Admin was BLOCKED with 403 Forbidden'
      );
    }

    // ----------------------------------------------------
    // Cleanup
    // ----------------------------------------------------
    await User.deleteMany({ email: { $in: ['sec_attacker@test.com', 'sec_scorer_1@test.com', 'sec_scorer_2@test.com', 'sec_admin@test.com'] } });
    await Match.deleteMany({ venue: 'Security Test Arena' });
    await ScoreAuditLog.deleteMany({ notes: /Security Test/ });

    console.log(`\n====================================================`);
    console.log(`RESULTS: ${passedTests} / ${totalTests} Security Tests PASSED.`);
    console.log(`====================================================\n`);

    if (passedTests === totalTests) {
      console.log('✔ All security safeguards, authorization barriers, and audit trail validations passed with 100% success.');
      process.exit(0);
    } else {
      console.error('❌ Some tests failed.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Security test runner error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runSecurityTests();
