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
      name: 'Thunderbolts',
      shortName: 'THU',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#F59E0B', // Amber
      secondaryColor: '#1E3A8A', // Navy
      coach: 'Vikram Mehta',
      stats: {
        played: 4,
        wins: 3,
        losses: 1,
        pointsFor: 185,
        pointsAgainst: 160,
        matches3x3: { played: 2, wins: 2, losses: 0 },
        matches5x5: { played: 2, wins: 1, losses: 1 },
      },
    });

    const team2 = await Team.create({
      name: 'Viper Strike',
      shortName: 'VIP',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#10B981', // Emerald
      secondaryColor: '#0F172A', // Slate
      coach: 'Ray Ramirez',
      stats: {
        played: 4,
        wins: 2,
        losses: 2,
        pointsFor: 172,
        pointsAgainst: 170,
        matches3x3: { played: 2, wins: 1, losses: 1 },
        matches5x5: { played: 2, wins: 1, losses: 1 },
      },
    });

    const team3 = await Team.create({
      name: 'Metro Hawks',
      shortName: 'HWK',
      logo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#EF4444', // Crimson
      secondaryColor: '#18181B', // Zinc
      coach: 'Sarah Connor',
      stats: {
        played: 2,
        wins: 1,
        losses: 1,
        pointsFor: 95,
        pointsAgainst: 98,
        matches3x3: { played: 1, wins: 1, losses: 0 },
        matches5x5: { played: 1, wins: 0, losses: 1 },
      },
    });

    const team4 = await Team.create({
      name: 'Urban Titans',
      shortName: 'TTN',
      logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#8B5CF6', // Purple
      secondaryColor: '#3B82F6', // Blue
      coach: 'Kenji Sato',
      stats: {
        played: 2,
        wins: 0,
        losses: 2,
        pointsFor: 80,
        pointsAgainst: 104,
        matches3x3: { played: 1, wins: 0, losses: 1 },
        matches5x5: { played: 1, wins: 0, losses: 1 },
      },
    });

    console.log('[Seed] Creating Players (10+ per team for 5x5 support)...');

    // Helper to generate player list
    const team1Data = [
      { name: 'Rahul Sharma', num: 7, pos: 'Guard', pts: 48, one: 18, two: 12, three: 2 },
      { name: 'Aman Verma', num: 11, pos: 'Forward', pts: 36, one: 14, two: 8, three: 2 },
      { name: 'Rohit Gupta', num: 23, pos: 'Center', pts: 25, one: 11, two: 4, three: 2 },
      { name: 'Arjun Das', num: 15, pos: 'Guard', pts: 22, one: 8, two: 4, three: 2 },
      { name: 'Kabir Singh', num: 5, pos: 'Forward', pts: 18, one: 6, two: 3, three: 2 },
      { name: 'Dev Patel', num: 9, pos: 'Guard', pts: 12, one: 4, two: 1, three: 2 },
      { name: 'Karan Johar', num: 13, pos: 'Forward', pts: 8, one: 2, two: 3, three: 0 },
      { name: 'Nikhil Roy', num: 21, pos: 'Center', pts: 6, one: 2, two: 2, three: 0 },
      { name: 'Sameer Joshi', num: 30, pos: 'Guard', pts: 5, one: 1, two: 2, three: 0 },
      { name: 'Varun Nair', num: 34, pos: 'Forward', pts: 5, one: 1, two: 2, three: 0 },
    ];

    const team2Data = [
      { name: 'Marcus Vance', num: 3, pos: 'Guard', pts: 45, one: 15, two: 12, three: 2 },
      { name: 'David Chen', num: 15, pos: 'Forward', pts: 32, one: 12, two: 7, three: 2 },
      { name: 'Leo Santos', num: 33, pos: 'Center', pts: 28, one: 10, two: 6, three: 2 },
      { name: 'Vivek Rao', num: 4, pos: 'Guard', pts: 20, one: 8, two: 3, three: 2 },
      { name: 'Mohit Kumar', num: 12, pos: 'Forward', pts: 16, one: 4, two: 3, three: 2 },
      { name: 'Raj Malhotra', num: 19, pos: 'Guard', pts: 14, one: 6, two: 4, three: 0 },
      { name: 'Siddharth Roy', num: 22, pos: 'Center', pts: 7, one: 3, two: 2, three: 0 },
      { name: 'Alex Rivera', num: 8, pos: 'Guard', pts: 5, one: 1, two: 2, three: 0 },
      { name: 'Lucas Scott', num: 27, pos: 'Forward', pts: 3, one: 1, two: 1, three: 0 },
      { name: 'Tyler Reed', num: 42, pos: 'Center', pts: 2, one: 2, two: 0, three: 0 },
    ];

    const team3Data = [
      { name: 'Malik Jenkins', num: 0, pos: 'Guard', pts: 38, one: 12, two: 7, three: 4 },
      { name: 'Trey Parker', num: 1, pos: 'Guard', pts: 20, one: 6, two: 4, three: 2 },
      { name: 'Andre Miller', num: 8, pos: 'Forward', pts: 15, one: 5, two: 2, three: 2 },
      { name: 'Derrick Rose', num: 25, pos: 'Guard', pts: 12, one: 4, two: 1, three: 2 },
      { name: 'Kevin Durant', num: 35, pos: 'Forward', pts: 10, one: 2, two: 1, three: 2 },
      { name: 'Zion Williamson', num: 55, pos: 'Center', pts: 8, one: 4, two: 2, three: 0 },
      { name: 'Chris Paul', num: 2, pos: 'Guard', pts: 4, one: 2, two: 1, three: 0 },
      { name: 'Bam Adebayo', num: 13, pos: 'Center', pts: 4, one: 2, two: 1, three: 0 },
      { name: 'Jayson Tatum', num: 20, pos: 'Forward', pts: 3, one: 1, two: 1, three: 0 },
      { name: 'Jaylen Brown', num: 24, pos: 'Guard', pts: 2, one: 0, two: 1, three: 0 },
    ];

    const team4Data = [
      { name: 'Tariq Al-Mansoor', num: 99, pos: 'Center', pts: 28, one: 10, two: 6, three: 2 },
      { name: 'Jamal Crawford', num: 11, pos: 'Guard', pts: 18, one: 6, two: 3, three: 2 },
      { name: 'Lou Williams', num: 23, pos: 'Guard', pts: 14, one: 4, two: 2, three: 2 },
      { name: 'Montrezl Harrell', num: 5, pos: 'Center', pts: 8, one: 2, two: 3, three: 0 },
      { name: 'Robert Horry', num: 25, pos: 'Forward', pts: 6, one: 0, two: 0, three: 2 },
      { name: 'Manu Ginobili', num: 20, pos: 'Guard', pts: 4, one: 2, two: 1, three: 0 },
      { name: 'Boris Diaw', num: 3, pos: 'Forward', pts: 2, one: 0, two: 1, three: 0 },
      { name: 'Tony Parker', num: 9, pos: 'Guard', pts: 0, one: 0, two: 0, three: 0 },
      { name: 'Tim Duncan', num: 21, pos: 'Center', pts: 0, one: 0, two: 0, three: 0 },
      { name: 'Kawhi Leonard', num: 2, pos: 'Forward', pts: 0, one: 0, two: 0, three: 0 },
    ];

    const createdT1 = [];
    for (const p of team1Data) {
      createdT1.push(
        await Player.create({
          name: p.name,
          jerseyNumber: p.num,
          position: p.pos,
          teamId: team1._id,
          stats: {
            games: 4,
            points: p.pts,
            onePoints: p.one,
            twoPoints: p.two,
            threePoints: p.three,
            rebounds: Math.floor(p.pts / 2) + 2,
            assists: Math.floor(p.pts / 3) + 1,
            steals: 3,
            blocks: 2,
            fouls: 4,
          },
        })
      );
    }

    const createdT2 = [];
    for (const p of team2Data) {
      createdT2.push(
        await Player.create({
          name: p.name,
          jerseyNumber: p.num,
          position: p.pos,
          teamId: team2._id,
          stats: {
            games: 4,
            points: p.pts,
            onePoints: p.one,
            twoPoints: p.two,
            threePoints: p.three,
            rebounds: Math.floor(p.pts / 2) + 1,
            assists: Math.floor(p.pts / 3) + 2,
            steals: 4,
            blocks: 1,
            fouls: 5,
          },
        })
      );
    }

    const createdT3 = [];
    for (const p of team3Data) {
      createdT3.push(
        await Player.create({
          name: p.name,
          jerseyNumber: p.num,
          position: p.pos,
          teamId: team3._id,
          stats: {
            games: 2,
            points: p.pts,
            onePoints: p.one,
            twoPoints: p.two,
            threePoints: p.three,
            rebounds: 8,
            assists: 6,
            steals: 2,
            blocks: 1,
            fouls: 3,
          },
        })
      );
    }

    const createdT4 = [];
    for (const p of team4Data) {
      createdT4.push(
        await Player.create({
          name: p.name,
          jerseyNumber: p.num,
          position: p.pos,
          teamId: team4._id,
          stats: {
            games: 2,
            points: p.pts,
            onePoints: p.one,
            twoPoints: p.two,
            threePoints: p.three,
            rebounds: 7,
            assists: 4,
            steals: 1,
            blocks: 2,
            fouls: 4,
          },
        })
      );
    }

    // Link players back to teams
    await Team.findByIdAndUpdate(team1._id, { players: createdT1.map((p) => p._id) });
    await Team.findByIdAndUpdate(team2._id, { players: createdT2.map((p) => p._id) });
    await Team.findByIdAndUpdate(team3._id, { players: createdT3.map((p) => p._id) });
    await Team.findByIdAndUpdate(team4._id, { players: createdT4.map((p) => p._id) });

    console.log('[Seed] Creating Tournaments...');
    const tournament = await Tournament.create({
      name: 'National Pro Basketball Circuit 2026',
      organizer: 'FIBA & HoopScore Federation',
      venue: 'Metropolitan Arena — Grand Court',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-15'),
      description: 'The premier national championship featuring both 3x3 and 5x5 formats.',
      teams: [team1._id, team2._id, team3._id, team4._id],
      status: 'ONGOING',
    });

    console.log('[Seed] Creating Completed 3x3 Match...');
    const completed3x3Match = await Match.create({
      matchType: '3x3',
      tournamentId: tournament._id,
      matchName: '3x3 Championship: Thunderbolts vs Viper Strike',
      venue: 'Metropolitan Arena — Court 1',
      scheduledDate: new Date('2026-09-10'),
      scheduledTime: '16:00',
      teamA: team1._id,
      teamB: team2._id,
      teamA_roster: {
        starters: [
          { player: createdT1[0]._id, name: createdT1[0].name, jerseyNumber: createdT1[0].jerseyNumber, position: createdT1[0].position },
          { player: createdT1[1]._id, name: createdT1[1].name, jerseyNumber: createdT1[1].jerseyNumber, position: createdT1[1].position },
          { player: createdT1[2]._id, name: createdT1[2].name, jerseyNumber: createdT1[2].jerseyNumber, position: createdT1[2].position },
        ],
        substitutes: [
          { player: createdT1[3]._id, name: createdT1[3].name, jerseyNumber: createdT1[3].jerseyNumber, position: createdT1[3].position },
        ],
      },
      teamB_roster: {
        starters: [
          { player: createdT2[0]._id, name: createdT2[0].name, jerseyNumber: createdT2[0].jerseyNumber, position: createdT2[0].position },
          { player: createdT2[1]._id, name: createdT2[1].name, jerseyNumber: createdT2[1].jerseyNumber, position: createdT2[1].position },
          { player: createdT2[2]._id, name: createdT2[2].name, jerseyNumber: createdT2[2].jerseyNumber, position: createdT2[2].position },
        ],
        substitutes: [
          { player: createdT2[3]._id, name: createdT2[3].name, jerseyNumber: createdT2[3].jerseyNumber, position: createdT2[3].position },
        ],
      },
      playersA: createdT1.slice(0, 4).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      playersB: createdT2.slice(0, 4).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
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
      currentPeriod: 'REGULATION',
      status: 'COMPLETED',
      possession: 'A',
      startedAt: new Date('2026-09-10T16:00:00Z'),
      endedAt: new Date('2026-09-10T16:18:26Z'),
      duration: 506,
      winner: 'A',
      winnerTeamId: team1._id,
      finalScore: '21 - 18',
      playerStats: [
        { playerId: createdT1[0]._id, playerName: createdT1[0].name, jerseyNumber: 7, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 11, onePoints: 5, twoPoints: 3, rebounds: 4, assists: 4, steals: 2, blocks: 1, fouls: 2 },
        { playerId: createdT1[1]._id, playerName: createdT1[1].name, jerseyNumber: 11, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 7, onePoints: 3, twoPoints: 2, rebounds: 8, assists: 3, steals: 1, blocks: 2, fouls: 3 },
        { playerId: createdT1[2]._id, playerName: createdT1[2].name, jerseyNumber: 23, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 3, onePoints: 3, twoPoints: 0, rebounds: 10, assists: 1, steals: 1, blocks: 3, fouls: 1 },
        { playerId: createdT1[3]._id, playerName: createdT1[3].name, jerseyNumber: 15, teamId: team1._id, team: 'A', isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, rebounds: 1, assists: 0, steals: 0, blocks: 0, fouls: 0 },
        { playerId: createdT2[0]._id, playerName: createdT2[0].name, jerseyNumber: 3, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 9, onePoints: 3, twoPoints: 3, rebounds: 3, assists: 5, steals: 3, blocks: 0, fouls: 1 },
        { playerId: createdT2[1]._id, playerName: createdT2[1].name, jerseyNumber: 15, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 5, onePoints: 3, twoPoints: 1, rebounds: 6, assists: 2, steals: 1, blocks: 1, fouls: 3 },
        { playerId: createdT2[2]._id, playerName: createdT2[2].name, jerseyNumber: 33, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 4, onePoints: 2, twoPoints: 1, rebounds: 9, assists: 1, steals: 0, blocks: 2, fouls: 3 },
        { playerId: createdT2[3]._id, playerName: createdT2[3].name, jerseyNumber: 4, teamId: team2._id, team: 'B', isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, rebounds: 0, assists: 1, steals: 0, blocks: 0, fouls: 0 },
      ],
    });

    await MatchEvent.create([
      { matchId: completed3x3Match._id, type: 'TIMER_START', gameTime: '10:00', metadata: { description: 'Match started' } },
      { matchId: completed3x3Match._id, type: 'SCORE', team: 'A', playerId: createdT1[0]._id, playerName: createdT1[0].name, jerseyNumber: 7, points: 2, gameTime: '09:34', metadata: { newScoreA: 2, newScoreB: 0, description: 'Rahul Sharma 2-pointer' } },
      { matchId: completed3x3Match._id, type: 'SCORE', team: 'B', playerId: createdT2[0]._id, playerName: createdT2[0].name, jerseyNumber: 3, points: 2, gameTime: '09:05', metadata: { newScoreA: 2, newScoreB: 2, description: 'Marcus Vance counters with 2-pointer' } },
      { matchId: completed3x3Match._id, type: 'SCORE', team: 'A', playerId: createdT1[0]._id, playerName: createdT1[0].name, jerseyNumber: 7, points: 2, gameTime: '01:34', metadata: { newScoreA: 21, newScoreB: 18, description: 'Rahul Sharma game-winning 2-pointer to reach 21!' } },
      { matchId: completed3x3Match._id, type: 'MATCH_END', gameTime: '01:34', metadata: { winner: 'A', finalScore: '21 - 18', description: 'Thunderbolts win 21-18 by reaching target score!' } },
    ]);

    console.log('[Seed] Creating Completed 5x5 Match (4 Quarters)...');
    const completed5x5Match = await Match.create({
      matchType: '5x5',
      tournamentId: tournament._id,
      matchName: '5x5 Pro Classic: Thunderbolts vs Viper Strike',
      venue: 'Metropolitan Arena — Grand Court',
      scheduledDate: new Date('2026-09-15'),
      scheduledTime: '19:00',
      teamA: team1._id,
      teamB: team2._id,
      teamA_roster: {
        starters: createdT1.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT1.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      teamB_roster: {
        starters: createdT2.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT2.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      playersA: createdT1.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      playersB: createdT2.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      scoreA: 84,
      scoreB: 78,
      foulsA: 3,
      foulsB: 4,
      timeoutsA: 2,
      timeoutsB: 1,
      settings: {
        gameDuration: 2400,
        shotClock: 24,
        targetScore: 0,
        numberOfQuarters: 4,
        quarterDuration: 600,
        foulLimit: 5,
      },
      gameDuration: 2400,
      remainingTime: 0,
      shotClockDuration: 24,
      shotClockRemaining: 0,
      targetScore: 0,
      foulLimit: 5,
      currentPeriod: 'Q4',
      periodScores: [
        { period: 'Q1', scoreA: 22, scoreB: 19 },
        { period: 'Q2', scoreA: 20, scoreB: 23 },
        { period: 'Q3', scoreA: 24, scoreB: 18 },
        { period: 'Q4', scoreA: 18, scoreB: 18 },
      ],
      status: 'COMPLETED',
      possession: 'A',
      startedAt: new Date('2026-09-15T19:00:00Z'),
      endedAt: new Date('2026-09-15T21:10:00Z'),
      duration: 2400,
      winner: 'A',
      winnerTeamId: team1._id,
      finalScore: '84 - 78',
      playerStats: createdT1.slice(0, 10).map((p, idx) => ({
        playerId: p._id,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: team1._id,
        team: 'A',
        isStarter: idx < 5,
        isActive: idx < 5,
        points: idx === 0 ? 24 : idx === 1 ? 18 : idx === 2 ? 14 : idx === 3 ? 12 : idx === 4 ? 8 : 4,
        onePoints: 4,
        twoPoints: 4,
        threePoints: idx < 4 ? 2 : 0,
        rebounds: 6,
        assists: 5,
        steals: 2,
        blocks: 1,
        fouls: 2,
      })).concat(
        createdT2.slice(0, 10).map((p, idx) => ({
          playerId: p._id,
          playerName: p.name,
          jerseyNumber: p.jerseyNumber,
          teamId: team2._id,
          team: 'B',
          isStarter: idx < 5,
          isActive: idx < 5,
          points: idx === 0 ? 26 : idx === 1 ? 16 : idx === 2 ? 14 : idx === 3 ? 10 : idx === 4 ? 6 : 3,
          onePoints: 4,
          twoPoints: 3,
          threePoints: idx < 3 ? 2 : 0,
          rebounds: 5,
          assists: 4,
          steals: 1,
          blocks: 2,
          fouls: 3,
        }))
      ),
    });

    await MatchEvent.create([
      { matchId: completed5x5Match._id, type: 'PERIOD_START', period: 'Q1', gameTime: '10:00', metadata: { description: 'Started Q1' } },
      { matchId: completed5x5Match._id, type: 'SCORE', team: 'A', points: 3, playerName: createdT1[0].name, jerseyNumber: createdT1[0].jerseyNumber, period: 'Q1', gameTime: '08:30', metadata: { description: 'Rahul Sharma 3PT Jump Shot' } },
      { matchId: completed5x5Match._id, type: 'PERIOD_END', period: 'Q1', gameTime: '00:00', metadata: { description: 'End of Q1 (22 - 19)' } },
      { matchId: completed5x5Match._id, type: 'PERIOD_START', period: 'Q2', gameTime: '10:00', metadata: { description: 'Started Q2' } },
      { matchId: completed5x5Match._id, type: 'SUBSTITUTION', team: 'A', playerOut: createdT1[0]._id, playerIn: createdT1[5]._id, playerName: `${createdT1[5].name} IN for ${createdT1[0].name}`, period: 'Q2', gameTime: '06:12', metadata: { description: 'Sub: Dev Patel IN for Rahul Sharma' } },
      { matchId: completed5x5Match._id, type: 'PERIOD_END', period: 'Q4', gameTime: '00:00', metadata: { description: 'End of Q4 (84 - 78)' } },
      { matchId: completed5x5Match._id, type: 'MATCH_END', period: 'Q4', gameTime: '00:00', metadata: { winner: 'A', finalScore: '84 - 78', description: 'Thunderbolts win 84-78!' } },
    ]);

    console.log('[Seed] Creating LIVE 3x3 Match...');
    const live3x3Match = await Match.create({
      matchType: '3x3',
      tournamentId: tournament._id,
      matchName: '3x3 Live Arena: Thunderbolts vs Viper Strike',
      venue: 'Metropolitan Arena — Court 1 (Live Center)',
      scheduledDate: new Date(),
      scheduledTime: '18:00',
      teamA: team1._id,
      teamB: team2._id,
      teamA_roster: {
        starters: [
          { player: createdT1[0]._id, name: createdT1[0].name, jerseyNumber: createdT1[0].jerseyNumber, position: createdT1[0].position },
          { player: createdT1[1]._id, name: createdT1[1].name, jerseyNumber: createdT1[1].jerseyNumber, position: createdT1[1].position },
          { player: createdT1[2]._id, name: createdT1[2].name, jerseyNumber: createdT1[2].jerseyNumber, position: createdT1[2].position },
        ],
        substitutes: [
          { player: createdT1[3]._id, name: createdT1[3].name, jerseyNumber: createdT1[3].jerseyNumber, position: createdT1[3].position },
        ],
      },
      teamB_roster: {
        starters: [
          { player: createdT2[0]._id, name: createdT2[0].name, jerseyNumber: createdT2[0].jerseyNumber, position: createdT2[0].position },
          { player: createdT2[1]._id, name: createdT2[1].name, jerseyNumber: createdT2[1].jerseyNumber, position: createdT2[1].position },
          { player: createdT2[2]._id, name: createdT2[2].name, jerseyNumber: createdT2[2].jerseyNumber, position: createdT2[2].position },
        ],
        substitutes: [
          { player: createdT2[3]._id, name: createdT2[3].name, jerseyNumber: createdT2[3].jerseyNumber, position: createdT2[3].position },
        ],
      },
      playersA: createdT1.slice(0, 4).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      playersB: createdT2.slice(0, 4).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      scoreA: 14,
      scoreB: 12,
      foulsA: 3,
      foulsB: 4,
      timeoutsA: 1,
      timeoutsB: 1,
      gameDuration: 600,
      remainingTime: 462, // 07:42 remaining as featured in the inspiration
      shotClockDuration: 12,
      shotClockRemaining: 12,
      targetScore: 21,
      foulLimit: 7,
      currentPeriod: 'REGULATION',
      status: 'LIVE',
      possession: 'A',
      timerRunning: false,
      shotClockRunning: false,
      startedAt: new Date(),
      playerStats: [
        { playerId: createdT1[0]._id, playerName: createdT1[0].name, jerseyNumber: 7, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 8, onePoints: 4, twoPoints: 2, rebounds: 4, assists: 2, steals: 1, blocks: 0, fouls: 1 },
        { playerId: createdT1[1]._id, playerName: createdT1[1].name, jerseyNumber: 11, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 4, onePoints: 2, twoPoints: 1, rebounds: 5, assists: 2, steals: 1, blocks: 1, fouls: 2 },
        { playerId: createdT1[2]._id, playerName: createdT1[2].name, jerseyNumber: 23, teamId: team1._id, team: 'A', isStarter: true, isActive: true, points: 2, onePoints: 2, twoPoints: 0, rebounds: 7, assists: 1, steals: 0, blocks: 2, fouls: 0 },
        { playerId: createdT1[3]._id, playerName: createdT1[3].name, jerseyNumber: 15, teamId: team1._id, team: 'A', isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0 },
        { playerId: createdT2[0]._id, playerName: createdT2[0].name, jerseyNumber: 3, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 6, onePoints: 2, twoPoints: 2, rebounds: 2, assists: 3, steals: 2, blocks: 0, fouls: 1 },
        { playerId: createdT2[1]._id, playerName: createdT2[1].name, jerseyNumber: 15, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 4, onePoints: 2, twoPoints: 1, rebounds: 4, assists: 1, steals: 1, blocks: 0, fouls: 2 },
        { playerId: createdT2[2]._id, playerName: createdT2[2].name, jerseyNumber: 33, teamId: team2._id, team: 'B', isStarter: true, isActive: true, points: 2, onePoints: 2, twoPoints: 0, rebounds: 6, assists: 0, steals: 0, blocks: 2, fouls: 1 },
        { playerId: createdT2[3]._id, playerName: createdT2[3].name, jerseyNumber: 4, teamId: team2._id, team: 'B', isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0 },
      ],
    });

    await MatchEvent.create([
      { matchId: live3x3Match._id, type: 'TIMER_START', gameTime: '10:00', metadata: { description: 'Match started' } },
      { matchId: live3x3Match._id, type: 'SCORE', team: 'A', playerId: createdT1[0]._id, playerName: createdT1[0].name, jerseyNumber: 7, points: 2, gameTime: '09:42', metadata: { newScoreA: 2, newScoreB: 0, description: 'Rahul Sharma +2' } },
      { matchId: live3x3Match._id, type: 'SCORE', team: 'B', playerId: createdT2[0]._id, playerName: createdT2[0].name, jerseyNumber: 3, points: 1, gameTime: '09:12', metadata: { newScoreA: 2, newScoreB: 1, description: 'Team B +1' } },
    ]);

    console.log('[Seed] Creating LIVE 5x5 Match (Quarter 2)...');
    const live5x5Match = await Match.create({
      matchType: '5x5',
      tournamentId: tournament._id,
      matchName: '5x5 Primetime: Metro Hawks vs Urban Titans',
      venue: 'Metropolitan Arena — Grand Court (Showcase)',
      scheduledDate: new Date(),
      scheduledTime: '20:30',
      teamA: team3._id,
      teamB: team4._id,
      teamA_roster: {
        starters: createdT3.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT3.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      teamB_roster: {
        starters: createdT4.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT4.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      playersA: createdT3.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      playersB: createdT4.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      scoreA: 38,
      scoreB: 35,
      foulsA: 2,
      foulsB: 3,
      timeoutsA: 2,
      timeoutsB: 2,
      settings: {
        gameDuration: 2400,
        shotClock: 24,
        targetScore: 0,
        numberOfQuarters: 4,
        quarterDuration: 600,
        foulLimit: 5,
      },
      gameDuration: 2400,
      remainingTime: 380, // 06:20 in Q2
      shotClockDuration: 24,
      shotClockRemaining: 24,
      targetScore: 0,
      foulLimit: 5,
      currentPeriod: 'Q2',
      periodScores: [
        { period: 'Q1', scoreA: 24, scoreB: 22 },
      ],
      status: 'LIVE',
      possession: 'B',
      timerRunning: false,
      shotClockRunning: false,
      startedAt: new Date(),
      playerStats: createdT3.slice(0, 10).map((p, idx) => ({
        playerId: p._id,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: team3._id,
        team: 'A',
        isStarter: idx < 5,
        isActive: idx < 5,
        points: idx === 0 ? 14 : idx === 1 ? 10 : idx === 2 ? 6 : idx === 3 ? 5 : idx === 4 ? 3 : 0,
        onePoints: 2,
        twoPoints: 2,
        threePoints: idx < 2 ? 1 : 0,
        rebounds: 3,
        assists: 2,
        steals: 1,
        blocks: 0,
        fouls: 1,
      })).concat(
        createdT4.slice(0, 10).map((p, idx) => ({
          playerId: p._id,
          playerName: p.name,
          jerseyNumber: p.jerseyNumber,
          teamId: team4._id,
          team: 'B',
          isStarter: idx < 5,
          isActive: idx < 5,
          points: idx === 0 ? 12 : idx === 1 ? 11 : idx === 2 ? 6 : idx === 3 ? 4 : idx === 4 ? 2 : 0,
          onePoints: 2,
          twoPoints: 2,
          threePoints: idx < 2 ? 1 : 0,
          rebounds: 4,
          assists: 2,
          steals: 1,
          blocks: 1,
          fouls: 2,
        }))
      ),
    });

    await MatchEvent.create([
      { matchId: live5x5Match._id, type: 'PERIOD_START', period: 'Q1', gameTime: '10:00', metadata: { description: 'Game started Q1' } },
      { matchId: live5x5Match._id, type: 'SCORE', team: 'A', points: 3, playerName: createdT3[0].name, jerseyNumber: createdT3[0].jerseyNumber, period: 'Q1', gameTime: '08:45', metadata: { description: `${createdT3[0].name} hits 3PT` } },
      { matchId: live5x5Match._id, type: 'PERIOD_END', period: 'Q1', gameTime: '00:00', metadata: { description: 'End of Q1 (24 - 22)' } },
      { matchId: live5x5Match._id, type: 'PERIOD_START', period: 'Q2', gameTime: '10:00', metadata: { description: 'Started Q2' } },
    ]);

    console.log('[Seed] Creating Scheduled 5x5 Match...');
    await Match.create({
      matchType: '5x5',
      tournamentId: tournament._id,
      matchName: '5x5 Conference Clash: Thunderbolts vs Metro Hawks',
      venue: 'Metropolitan Arena Court 1',
      scheduledDate: new Date('2026-10-05'),
      scheduledTime: '19:30',
      teamA: team1._id,
      teamB: team3._id,
      teamA_roster: {
        starters: createdT1.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT1.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      teamB_roster: {
        starters: createdT3.slice(0, 5).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
        substitutes: createdT3.slice(5, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      },
      playersA: createdT1.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      playersB: createdT3.slice(0, 10).map((p) => ({ player: p._id, name: p.name, jerseyNumber: p.jerseyNumber, position: p.position })),
      status: 'SCHEDULED',
      settings: {
        gameDuration: 2400,
        shotClock: 24,
        targetScore: 0,
        numberOfQuarters: 4,
        quarterDuration: 600,
        foulLimit: 5,
      },
    });

    console.log('==================================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials:');
    console.log('  Admin:  admin@hoopscore.com  / admin123');
    console.log('  Scorer: scorer@hoopscore.com / scorer123');
    console.log('  Viewer: viewer@hoopscore.com / viewer123');
    console.log(`Live 3x3 Match ID: ${live3x3Match._id}`);
    console.log(`Live 5x5 Match ID: ${live5x5Match._id}`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
