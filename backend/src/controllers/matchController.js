const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Team = require('../models/Team');
const Player = require('../models/Player');

// @desc    Get matches with search & filters (including matchType: 3x3 or 5x5)
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res) => {
  try {
    const { tournamentId, teamId, status, matchType, search, limit } = req.query;
    let query = {};

    if (matchType && ['3x3', '5x5'].includes(matchType)) {
      query.matchType = matchType;
    }

    if (tournamentId) {
      query.tournamentId = tournamentId;
    }

    if (teamId) {
      query.$or = [{ teamA: teamId }, { teamB: teamId }];
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const matchingTeams = await Team.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      const teamIds = matchingTeams.map((t) => t._id);

      query.$or = [
        { matchName: { $regex: search, $options: 'i' } },
        { teamA: { $in: teamIds } },
        { teamB: { $in: teamIds } },
      ];
    }

    let matchQuery = Match.find(query)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue')
      .sort({ createdAt: -1 })
      .lean();

    if (limit) {
      matchQuery = matchQuery.limit(Number(limit));
    }

    const matches = await matchQuery;
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single match by ID with events & full rosters
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor coach')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor coach')
      .populate('tournamentId', 'name venue organizer')
      .populate('playersA.player', 'name jerseyNumber position profileImage')
      .populate('playersB.player', 'name jerseyNumber position profileImage')
      .populate('teamA_roster.starters.player', 'name jerseyNumber position profileImage')
      .populate('teamA_roster.substitutes.player', 'name jerseyNumber position profileImage')
      .populate('teamB_roster.starters.player', 'name jerseyNumber position profileImage')
      .populate('teamB_roster.substitutes.player', 'name jerseyNumber position profileImage');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const events = await MatchEvent.find({ matchId: match._id }).sort({ timestamp: 1 });

    const currentRemainingTime = match.getCurrentRemainingTime();
    const currentShotClockRemaining = match.getCurrentShotClockRemaining();

    const responseData = match.toObject();
    responseData.remainingTime = currentRemainingTime;
    responseData.shotClockRemaining = currentShotClockRemaining;
    responseData.events = events;

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new match with 3x3 or 5x5 validation
// @route   POST /api/matches
// @access  Private/Admin
const createMatch = async (req, res) => {
  try {
    const {
      matchType = '3x3',
      tournamentId,
      matchName,
      venue,
      scheduledDate,
      scheduledTime,
      teamA,
      teamB,
      teamA_starters = [],
      teamA_substitutes = [],
      teamB_starters = [],
      teamB_substitutes = [],
      settings = {},
    } = req.body;

    if (!['3x3', '5x5'].includes(matchType)) {
      return res.status(400).json({ success: false, message: 'Invalid match type. Must be 3x3 or 5x5.' });
    }

    if (!matchName || !teamA || !teamB) {
      return res.status(400).json({
        success: false,
        message: 'Match name, Team A, and Team B are required',
      });
    }

    if (teamA === teamB) {
      return res.status(400).json({
        success: false,
        message: 'Team A and Team B cannot be the same team',
      });
    }

    // Strict Backend Roster Validation
    const reqStarters = matchType === '3x3' ? 3 : 5;
    const reqSubs = matchType === '3x3' ? 1 : 5;
    const totalRequired = reqStarters + reqSubs;

    if (teamA_starters.length !== reqStarters || teamA_substitutes.length !== reqSubs) {
      return res.status(400).json({
        success: false,
        message:
          matchType === '3x3'
            ? '3x3 requires exactly 3 starting players and 1 substitute for Team A.'
            : '5x5 requires exactly 5 starting players and 5 substitutes for Team A.',
      });
    }

    if (teamB_starters.length !== reqStarters || teamB_substitutes.length !== reqSubs) {
      return res.status(400).json({
        success: false,
        message:
          matchType === '3x3'
            ? '3x3 requires exactly 3 starting players and 1 substitute for Team B.'
            : '5x5 requires exactly 5 starting players and 5 substitutes for Team B.',
      });
    }

    // Helper to format player documents into embedded schema
    const formatPlayerList = async (playerIds) => {
      const docs = await Player.find({ _id: { $in: playerIds } });
      return docs.map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position || 'Guard',
      }));
    };

    const formattedAStarters = await formatPlayerList(teamA_starters);
    const formattedASubs = await formatPlayerList(teamA_substitutes);
    const formattedBStarters = await formatPlayerList(teamB_starters);
    const formattedBSubs = await formatPlayerList(teamB_substitutes);

    const allPlayersA = [...formattedAStarters, ...formattedASubs];
    const allPlayersB = [...formattedBStarters, ...formattedBSubs];

    // Initial in-match player stats with starter and active flags
    const initialPlayerStats = [
      ...formattedAStarters.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamA,
        team: 'A',
        isStarter: true,
        isActive: true, // on court
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        threePoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        minutes: 0,
      })),
      ...formattedASubs.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamA,
        team: 'A',
        isStarter: false,
        isActive: false, // on bench
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        threePoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        minutes: 0,
      })),
      ...formattedBStarters.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamB,
        team: 'B',
        isStarter: true,
        isActive: true,
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        threePoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        minutes: 0,
      })),
      ...formattedBSubs.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamB,
        team: 'B',
        isStarter: false,
        isActive: false,
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        threePoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        minutes: 0,
      })),
    ];

    // Compute format-dependent settings
    const matchSettings = {
      gameDuration: settings.gameDuration || (matchType === '3x3' ? 600 : 600),
      shotClock: settings.shotClock || (matchType === '3x3' ? 12 : 24),
      targetScore: settings.targetScore !== undefined ? settings.targetScore : matchType === '3x3' ? 21 : 0,
      numberOfQuarters: settings.numberOfQuarters || (matchType === '3x3' ? 1 : 4),
      quarterDuration: settings.quarterDuration || (matchType === '3x3' ? 600 : 600),
      foulLimit: settings.foulLimit || (matchType === '3x3' ? 7 : 5),
    };

    const initialPeriod = matchType === '3x3' ? 'REGULATION' : 'Q1';

    const match = await Match.create({
      matchType,
      tournamentId: tournamentId || null,
      matchName,
      venue: venue || (matchType === '3x3' ? '3x3 Center Court' : 'Main Arena Court'),
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || '18:00',
      teamA,
      teamB,
      teamA_roster: {
        starters: formattedAStarters,
        substitutes: formattedASubs,
      },
      teamB_roster: {
        starters: formattedBStarters,
        substitutes: formattedBSubs,
      },
      playersA: allPlayersA,
      playersB: allPlayersB,
      settings: matchSettings,
      gameDuration: matchSettings.quarterDuration,
      remainingTime: matchSettings.quarterDuration,
      shotClockDuration: matchSettings.shotClock,
      shotClockRemaining: matchSettings.shotClock,
      targetScore: matchSettings.targetScore,
      foulLimit: matchSettings.foulLimit,
      currentPeriod: initialPeriod,
      periodScores: [{ period: initialPeriod, scoreA: 0, scoreB: 0 }],
      status: 'SCHEDULED',
      playerStats: initialPlayerStats,
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue');

    res.status(201).json({ success: true, data: populatedMatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update match settings / details
// @route   PUT /api/matches/:id
// @access  Private/Admin or Scorer
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teamA', 'name shortName logo primaryColor')
      .populate('teamB', 'name shortName logo primaryColor');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private/Admin
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    await MatchEvent.deleteMany({ matchId: match._id });
    await match.deleteOne();

    res.status(200).json({ success: true, message: 'Match and associated events deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get match summary & printable report with format breakdown
// @route   GET /api/matches/:id/summary
// @access  Public
const getMatchSummary = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor coach')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor coach')
      .populate('tournamentId', 'name venue organizer');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const events = await MatchEvent.find({ matchId: match._id }).sort({ timestamp: 1 });

    const summary = {
      matchId: match._id,
      matchType: match.matchType || '3x3',
      matchName: match.matchName,
      tournament: match.tournamentId ? match.tournamentId.name : 'Exhibition Match',
      venue: match.venue,
      status: match.status,
      currentPeriod: match.currentPeriod,
      periodScores: match.periodScores,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      durationMinutes: match.duration ? Math.round(match.duration / 60) : 10,
      teamA: {
        name: match.teamA.name,
        shortName: match.teamA.shortName,
        score: match.scoreA,
        fouls: match.foulsA,
        coach: match.teamA.coach,
        starters: match.teamA_roster?.starters || [],
        substitutes: match.teamA_roster?.substitutes || [],
      },
      teamB: {
        name: match.teamB.name,
        shortName: match.teamB.shortName,
        score: match.scoreB,
        fouls: match.foulsB,
        coach: match.teamB.coach,
        starters: match.teamB_roster?.starters || [],
        substitutes: match.teamB_roster?.substitutes || [],
      },
      winner:
        match.winner === 'A'
          ? match.teamA.name
          : match.winner === 'B'
          ? match.teamB.name
          : match.winner === 'DRAW'
          ? 'Draw'
          : 'In Progress',
      finalScore: `${match.scoreA} - ${match.scoreB}`,
      playerStats: match.playerStats,
      eventsCount: events.length,
      timeline: events,
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchSummary,
};
