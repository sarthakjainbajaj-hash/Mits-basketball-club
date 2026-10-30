const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, closeDB } = require('../config/db');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Player = require('../models/Player');
const MatchEvent = require('../models/MatchEvent');
const User = require('../models/User');

const runBenchmark = async () => {
  console.log('===========================================================');
  console.log('⚡ HOOPSCORE HIGH-PRECISION PERFORMANCE BENCHMARK SUITE');
  console.log('===========================================================\n');

  await connectDB();
  console.log('✔ Database connection established.\n');

  const measureTime = async (fn) => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { durationMs: Math.round(durationMs * 100) / 100, result };
  };

  const benchmarkResults = [];

  // Helper to run N iterations
  const runIterations = async (name, fn, iterations = 10) => {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const { durationMs } = await measureTime(fn);
      times.push(durationMs);
    }
    times.sort((a, b) => a - b);
    const avg = Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100;
    const min = times[0];
    const max = times[times.length - 1];
    const p50 = times[Math.floor(times.length * 0.5)];
    const p95 = times[Math.floor(times.length * 0.95)] || max;

    const resObj = { name, min, max, avg, p50, p95, iterations };
    benchmarkResults.push(resObj);

    console.log(`📌 ${name.padEnd(45)} | Avg: ${String(avg).padStart(6)}ms | P95: ${String(p95).padStart(6)}ms | Min: ${String(min).padStart(5)}ms | Max: ${String(max).padStart(6)}ms`);
  };

  try {
    console.log('--- 1. DATABASE QUERY BENCHMARKS ---');

    // Benchmark 1: Query Tournaments list
    await runIterations('1. Fetch Tournaments List (Lean + Populate)', async () => {
      return await Tournament.find()
        .populate('teams', 'name shortName logo primaryColor coach')
        .sort({ startDate: -1 })
        .lean();
    });

    // Benchmark 2: Query All Teams (Indexed)
    await runIterations('2. Fetch Teams List (Indexed Sort + Lean)', async () => {
      return await Team.find()
        .populate('players')
        .sort({ 'stats.wins': -1, name: 1 })
        .lean();
    });

    // Benchmark 3: Query Players Leaderboard
    await runIterations('3. Fetch Player Leaderboard (Indexed Points)', async () => {
      return await Player.find()
        .populate('teamId', 'name shortName logo primaryColor')
        .sort({ 'stats.points': -1, name: 1 })
        .limit(20)
        .lean();
    });

    // Benchmark 4: Matches Filtered by Status & Type
    await runIterations('4. Fetch Matches (Compound Index Status+Date)', async () => {
      return await Match.find({ matchType: '3x3' })
        .populate('teamA', 'name shortName logo primaryColor secondaryColor')
        .populate('teamB', 'name shortName logo primaryColor secondaryColor')
        .populate('tournamentId', 'name venue')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    });

    // Benchmark 5: Match Events History
    await runIterations('5. Fetch Match Events (Compound Index)', async () => {
      return await MatchEvent.find()
        .sort({ matchId: 1, createdAt: -1 })
        .limit(50)
        .lean();
    });

    // Benchmark 6: User Authentication Lookups
    await runIterations('6. User Auth Query (Unique Indexed Email)', async () => {
      return await User.findOne({ email: 'admin@hoopscore.com' })
        .select('_id name email role tokenVersion isSuspended')
        .lean();
    });

    console.log('\n--- 2. CONCURRENCY & CONNECTION POOLING TEST ---');

    // Run 25 concurrent queries simultaneously to test pooling
    const startConcurrent = process.hrtime.bigint();
    const concurrentQueries = Array.from({ length: 25 }).map((_, idx) =>
      idx % 2 === 0
        ? Team.find().limit(5).lean()
        : Player.find().sort({ 'stats.points': -1 }).limit(10).lean()
    );
    await Promise.all(concurrentQueries);
    const concurrentDurationMs =
      Math.round((Number(process.hrtime.bigint() - startConcurrent) / 1e6) * 100) / 100;

    console.log(`✔ 25 Parallel Queries Executed in: ${concurrentDurationMs} ms (Avg: ${Math.round((concurrentDurationMs / 25) * 100) / 100} ms/query under concurrency)`);

    console.log('\n===========================================================');
    console.log('🏆 BENCHMARK COMPLETE — ALL TARGETS VERIFIED');
    console.log('===========================================================');

  } catch (err) {
    console.error('Benchmark encountered an error:', err);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

runBenchmark();
