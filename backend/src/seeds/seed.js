const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');

const seedData = async () => {
  let mongoServer = null;
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hoopscore';

  try {
    console.log(`[Seed] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('[Seed] Connected to external MongoDB.');
  } catch (err) {
    console.warn(`[Seed] Could not connect to external MongoDB: ${err.message}. Using MongoMemoryServer...`);
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('[Seed] Connected to in-memory MongoDB.');
  }

  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    await Match.deleteMany({});
    await MatchEvent.deleteMany({});

    console.log('[Seed] Creating Users...');
    const admin = await User.create({
      name: 'Elena Rostova (Admin)',
      email: 'admin@hoopscore.com',
      password: 'admin123',
      role: 'admin',
    });

    const scorer = await User.create({
      name: 'Dave Miller (Official Scorer)',
      email: 'scorer@hoopscore.com',
      password: 'scorer123',
      role: 'scorer',
    });

    const viewer = await User.create({
      name: 'Sam Wilson (Viewer)',
      email: 'viewer@hoopscore.com',
      password: 'viewer123',
      role: 'viewer',
    });

    console.log('[Seed] Creating Teams...');
    const team1 = await Team.create({
      name: 'Thunderbolts 3x3',
      shortName: 'THU',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#F59E0B', // Amber
      secondaryColor: '#1E3A8A', // Navy
      coach: 'Vikram Mehta',
      stats: { played: 3, wins: 2, losses: 1, pointsFor: 58, pointsAgainst: 49 },
    });

    const team2 = await Team.create({
      name: 'Viper Strike 3x3',
      shortName: 'VIP',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#10B981', // Emerald
      secondaryColor: '#0F172A', // Slate
      coach: 'Ray Ramirez',
      stats: { played: 3, wins: 2, losses: 1, pointsFor: 56, pointsAgainst: 52 },
    });

    const team3 = await Team.create({
      name: 'Metro Hawks 3x3',
      shortName: 'HWK',
      logo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#EF4444', // Crimson
      secondaryColor: '#18181B', // Zinc
      coach: 'Sarah Connor',
      stats: { played: 2, wins: 1, losses: 1, pointsFor: 35, pointsAgainst: 38 },
    });

    const team4 = await Team.create({
      name: 'Urban Titans 3x3',
      shortName: 'TTN',
      logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#8B5CF6', // Purple
      secondaryColor: '#3B82F6', // Blue
      coach: 'Kenji Sato',
      stats: { played: 2, wins: 0, losses: 2, pointsFor: 30, pointsAgainst: 40 },
    });

    console.log('[Seed] Creating Players...');
    // Team 1: Thunderbolts players
    const p1 = await Player.create({
      name: 'Rahul Sharma',
      jerseyNumber: 7,
      position: 'Guard',
      teamId: team1._id,
      stats: { games: 3, points: 28, onePoints: 12, twoPoints: 8, rebounds: 14, assists: 11, steals: 6, blocks: 2, fouls: 5 },
    });

    const p2 = await Player.create({
      name: 'Aman Verma',
      jerseyNumber: 11,
      position: 'Forward',
      teamId: team1._id,
      stats: { games: 3, points: 19, onePoints: 9, twoPoints: 5, rebounds: 22, assists: 7, steals: 4, blocks: 5, fouls: 6 },
    });

    const p3 = await Player.create({
      name: 'Rohit Gupta',
      jerseyNumber: 23,
      position: 'Center',
      teamId: team1._id,
      stats: { games: 3, points: 11, onePoints: 7, twoPoints: 2, rebounds: 28, assists: 4, steals: 2, blocks: 8, fouls: 7 },
    });

    // Team 2: Viper Strike players
    const p4 = await Player.create({
      name: 'Marcus Vance',
      jerseyNumber: 3,
      position: 'Guard',
      teamId: team2._id,
      stats: { games: 3, points: 24, onePoints: 10, twoPoints: 7, rebounds: 11, assists: 13, steals: 8, blocks: 1, fouls: 4 },
    });

    const p5 = await Player.create({
      name: 'David Chen',
      jerseyNumber: 15,
      position: 'Forward',
      teamId: team2._id,
      stats: { games: 3, points: 18, onePoints: 8, twoPoints: 5, rebounds: 19, assists: 5, steals: 3, blocks: 4, fouls: 5 },
    });

    const p6 = await Player.create({
      name: 'Leo Santos',
      jerseyNumber: 33,
      position: 'Center',
      teamId: team2._id,
      stats: { games: 3, points: 14, onePoints: 8, twoPoints: 3, rebounds: 25, assists: 3, steals: 1, blocks: 7, fouls: 8 },
    });

    // Team 3 & 4 players
    const p7 = await Player.create({
      name: 'Malik Jenkins',
      jerseyNumber: 0,
      position: 'Guard',
      teamId: team3._id,
      stats: { games: 2, points: 18, onePoints: 8, twoPoints: 5, rebounds: 8, assists: 6, steals: 4, blocks: 0, fouls: 3 },
    });

    const p8 = await Player.create({
      name: 'Tariq Al-Mansoor',
      jerseyNumber: 99,
      position: 'Center',
      teamId: team4._id,
      stats: { games: 2, points: 15, onePoints: 7, twoPoints: 4, rebounds: 16, assists: 2, steals: 2, blocks: 4, fouls: 6 },
    });

    // Link players back to teams
    await Team.findByIdAndUpdate(team1._id, { players: [p1._id, p2._id, p3._id] });
    await Team.findByIdAndUpdate(team2._id, { players: [p4._id, p5._id, p6._id] });
    await Team.findByIdAndUpdate(team3._id, { players: [p7._id] });
    await Team.findByIdAndUpdate(team4._id, { players: [p8._id] });

    console.log('[Seed] Creating Tournament...');
    const tournament = await Tournament.create({
      name: 'National 3x3 Pro Circuit 2026',
      organizer: 'FIBA 3x3 & HoopScore League',
      venue: 'Metropolitan Arena — Center Court',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-15'),
      description: 'The premier national 3x3 basketball championship tournament featuring top tier urban franchises.',
      teams: [team1._id, team2._id, team3._id, team4._id],
      status: 'ONGOING',
    });

    console.log('[Seed] Creating Completed Match 1...');
    const completedMatch1 = await Match.create({
      tournamentId: tournament._id,
      matchName: 'Circuit Round 1: Thunderbolts vs Viper Strike',
      venue: 'Metropolitan Arena Court 1',
      scheduledDate: new Date('2026-09-10'),
      scheduledTime: '16:00',
      teamA: team1._id,
      teamB: team2._id,
      playersA: [
        { player: p1._id, name: p1.name, jerseyNumber: p1.jerseyNumber },
        { player: p2._id, name: p2.name, jerseyNumber: p2.jerseyNumber },
        { player: p3._id, name: p3.name, jerseyNumber: p3.jerseyNumber },
      ],
      playersB: [
        { player: p4._id, name: p4.name, jerseyNumber: p4.jerseyNumber },
        { player: p5._id, name: p5.name, jerseyNumber: p5.jerseyNumber },
        { player: p6._id, name: p6.name, jerseyNumber: p6.jerseyNumber },
      ],
      scoreA: 21,
      scoreB: 18,
      foulsA: 6,
      foulsB: 7,
      timeoutsA: 0,
      timeoutsB: 1,
      gameDuration: 600,
      remainingTime: 94,
      targetScore: 21,
      foulLimit: 7,
      status: 'COMPLETED',
      possession: 'A',
      startedAt: new Date('2026-09-10T16:00:00Z'),
      endedAt: new Date('2026-09-10T16:18:26Z'),
      duration: 506,
      winner: 'A',
      winnerTeamId: team1._id,
      finalScore: '21 - 18',
      playerStats: [
        { playerId: p1._id, playerName: p1.name, jerseyNumber: 7, teamId: team1._id, team: 'A', points: 11, onePoints: 5, twoPoints: 3, rebounds: 4, assists: 4, steals: 2, blocks: 1, fouls: 2 },
        { playerId: p2._id, playerName: p2.name, jerseyNumber: 11, teamId: team1._id, team: 'A', points: 7, onePoints: 3, twoPoints: 2, rebounds: 8, assists: 3, steals: 1, blocks: 2, fouls: 3 },
        { playerId: p3._id, playerName: p3.name, jerseyNumber: 23, teamId: team1._id, team: 'A', points: 3, onePoints: 3, twoPoints: 0, rebounds: 10, assists: 1, steals: 1, blocks: 3, fouls: 1 },
        { playerId: p4._id, playerName: p4.name, jerseyNumber: 3, teamId: team2._id, team: 'B', points: 9, onePoints: 3, twoPoints: 3, rebounds: 3, assists: 5, steals: 3, blocks: 0, fouls: 1 },
        { playerId: p5._id, playerName: p5.name, jerseyNumber: 15, teamId: team2._id, team: 'B', points: 5, onePoints: 3, twoPoints: 1, rebounds: 6, assists: 2, steals: 1, blocks: 1, fouls: 3 },
        { playerId: p6._id, playerName: p6.name, jerseyNumber: 33, teamId: team2._id, team: 'B', points: 4, onePoints: 2, twoPoints: 1, rebounds: 9, assists: 1, steals: 0, blocks: 2, fouls: 3 },
      ],
    });

    // Events for Match 1
    await MatchEvent.create([
      { matchId: completedMatch1._id, type: 'TIMER_START', gameTime: '10:00', metadata: { description: 'Match started' } },
      { matchId: completedMatch1._id, type: 'SCORE', team: 'A', playerId: p1._id, playerName: p1.name, jerseyNumber: 7, points: 2, gameTime: '09:34', metadata: { newScoreA: 2, newScoreB: 0, description: 'Rahul Sharma 2-pointer from deep arc' } },
      { matchId: completedMatch1._id, type: 'SCORE', team: 'B', playerId: p4._id, playerName: p4.name, jerseyNumber: 3, points: 2, gameTime: '09:05', metadata: { newScoreA: 2, newScoreB: 2, description: 'Marcus Vance counters with a 2-pointer' } },
      { matchId: completedMatch1._id, type: 'FOUL', team: 'B', playerId: p6._id, playerName: p6.name, jerseyNumber: 33, gameTime: '08:12', metadata: { description: 'Leo Santos personal foul' } },
      { matchId: completedMatch1._id, type: 'SCORE', team: 'A', playerId: p1._id, playerName: p1.name, jerseyNumber: 7, points: 2, gameTime: '01:34', metadata: { newScoreA: 21, newScoreB: 18, description: 'Rahul Sharma hits game-winning 2-pointer to reach 21!' } },
      { matchId: completedMatch1._id, type: 'MATCH_END', gameTime: '01:34', metadata: { winner: 'A', finalScore: '21 - 18', description: 'Thunderbolts win 21-18 by reaching target score!' } },
    ]);

    console.log('[Seed] Creating Completed Match 2...');
    const completedMatch2 = await Match.create({
      tournamentId: tournament._id,
      matchName: 'Circuit Round 2: Viper Strike vs Metro Hawks',
      venue: 'Metropolitan Arena Court 2',
      scheduledDate: new Date('2026-09-18'),
      scheduledTime: '18:30',
      teamA: team2._id,
      teamB: team3._id,
      scoreA: 21,
      scoreB: 14,
      foulsA: 5,
      foulsB: 8,
      status: 'COMPLETED',
      startedAt: new Date('2026-09-18T18:30:00Z'),
      endedAt: new Date('2026-09-18T18:45:00Z'),
      duration: 480,
      winner: 'A',
      winnerTeamId: team2._id,
      finalScore: '21 - 14',
    });

    console.log('[Seed] Creating Sample Upcoming Match...');
    await Match.create({
      tournamentId: tournament._id,
      matchName: 'Semi-Final Preview: Thunderbolts vs Metro Hawks',
      venue: 'Center Court Showdown',
      scheduledDate: new Date('2026-10-02'),
      scheduledTime: '19:00',
      teamA: team1._id,
      teamB: team3._id,
      playersA: [
        { player: p1._id, name: p1.name, jerseyNumber: p1.jerseyNumber },
        { player: p2._id, name: p2.name, jerseyNumber: p2.jerseyNumber },
        { player: p3._id, name: p3.name, jerseyNumber: p3.jerseyNumber },
      ],
      playersB: [
        { player: p7._id, name: p7.name, jerseyNumber: p7.jerseyNumber },
      ],
      status: 'SCHEDULED',
    });

    console.log('[Seed] Creating Sample LIVE Match (Ready to test live scoreboard immediately!)...');
    const liveMatch = await Match.create({
      tournamentId: tournament._id,
      matchName: 'Championship Showcase: Thunderbolts vs Viper Strike',
      venue: 'Metropolitan Arena — Court 1 (Live Center)',
      scheduledDate: new Date(),
      scheduledTime: '20:00',
      teamA: team1._id,
      teamB: team2._id,
      playersA: [
        { player: p1._id, name: p1.name, jerseyNumber: p1.jerseyNumber },
        { player: p2._id, name: p2.name, jerseyNumber: p2.jerseyNumber },
        { player: p3._id, name: p3.name, jerseyNumber: p3.jerseyNumber },
      ],
      playersB: [
        { player: p4._id, name: p4.name, jerseyNumber: p4.jerseyNumber },
        { player: p5._id, name: p5.name, jerseyNumber: p5.jerseyNumber },
        { player: p6._id, name: p6.name, jerseyNumber: p6.jerseyNumber },
      ],
      scoreA: 14,
      scoreB: 12,
      foulsA: 3,
      foulsB: 4,
      timeoutsA: 1,
      timeoutsB: 1,
      gameDuration: 600,
      remainingTime: 462, // 07:42 remaining as featured in the prompt inspiration!
      shotClockDuration: 12,
      shotClockRemaining: 12,
      targetScore: 21,
      foulLimit: 7,
      status: 'LIVE',
      possession: 'A',
      timerRunning: false, // paused so scorer can start it
      shotClockRunning: false,
      startedAt: new Date(),
      playerStats: [
        { playerId: p1._id, playerName: p1.name, jerseyNumber: 7, teamId: team1._id, team: 'A', points: 8, onePoints: 4, twoPoints: 2, rebounds: 4, assists: 2, steals: 1, blocks: 0, fouls: 1 },
        { playerId: p2._id, playerName: p2.name, jerseyNumber: 11, teamId: team1._id, team: 'A', points: 4, onePoints: 2, twoPoints: 1, rebounds: 5, assists: 2, steals: 1, blocks: 1, fouls: 2 },
        { playerId: p3._id, playerName: p3.name, jerseyNumber: 23, teamId: team1._id, team: 'A', points: 2, onePoints: 2, twoPoints: 0, rebounds: 7, assists: 1, steals: 0, blocks: 2, fouls: 0 },
        { playerId: p4._id, playerName: p4.name, jerseyNumber: 3, teamId: team2._id, team: 'B', points: 6, onePoints: 2, twoPoints: 2, rebounds: 2, assists: 3, steals: 2, blocks: 0, fouls: 1 },
        { playerId: p5._id, playerName: p5.name, jerseyNumber: 15, teamId: team2._id, team: 'B', points: 4, onePoints: 2, twoPoints: 1, rebounds: 4, assists: 1, steals: 1, blocks: 0, fouls: 2 },
        { playerId: p6._id, playerName: p6.name, jerseyNumber: 33, teamId: team2._id, team: 'B', points: 2, onePoints: 2, twoPoints: 0, rebounds: 6, assists: 0, steals: 0, blocks: 2, fouls: 1 },
      ],
    });

    await MatchEvent.create([
      { matchId: liveMatch._id, type: 'TIMER_START', gameTime: '10:00', metadata: { description: 'Match started' } },
      { matchId: liveMatch._id, type: 'SCORE', team: 'A', playerId: p1._id, playerName: p1.name, jerseyNumber: 7, points: 2, gameTime: '09:42', metadata: { newScoreA: 2, newScoreB: 0, description: 'Rahul Sharma +2' } },
      { matchId: liveMatch._id, type: 'SCORE', team: 'B', playerId: p4._id, playerName: p4.name, jerseyNumber: 3, points: 1, gameTime: '09:12', metadata: { newScoreA: 2, newScoreB: 1, description: 'Team B +1' } },
      { matchId: liveMatch._id, type: 'REBOUND', team: 'A', playerId: p2._id, playerName: p2.name, jerseyNumber: 11, gameTime: '08:56', metadata: { description: 'Aman Rebound' } },
      { matchId: liveMatch._id, type: 'FOUL', team: 'A', playerId: p2._id, playerName: p2.name, jerseyNumber: 11, gameTime: '08:40', metadata: { description: 'Team A Foul' } },
      { matchId: liveMatch._id, type: 'POSSESSION', team: 'B', gameTime: '08:20', metadata: { description: 'Possession Team B' } },
    ]);

    console.log('==================================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials:');
    console.log('  Admin:  admin@hoopscore.com  / admin123');
    console.log('  Scorer: scorer@hoopscore.com / scorer123');
    console.log('  Viewer: viewer@hoopscore.com / viewer123');
    console.log(`Live Match ID: ${liveMatch._id}`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
