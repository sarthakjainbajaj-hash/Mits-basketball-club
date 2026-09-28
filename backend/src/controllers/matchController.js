const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Team = require('../models/Team');
const Player = require('../models/Player');

// @desc    Get matches with search & filters
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res) => {
  try {
    const { tournamentId, teamId, status, search, limit } = req.query;
    let query = {};

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
      // Find matching teams first
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
      .sort({ createdAt: -1 });

    if (limit) {
      matchQuery = matchQuery.limit(Number(limit));
    }

    const matches = await matchQuery;
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single match by ID with events
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor coach')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor coach')
      .populate('tournamentId', 'name venue organizer')
      .populate('playersA.player', 'name jerseyNumber position profileImage')
      .populate('playersB.player', 'name jerseyNumber position profileImage');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Fetch match event history
    const events = await MatchEvent.find({ matchId: match._id }).sort({ timestamp: 1 });

    // Compute live remaining time if timer is currently running
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

// @desc    Create new match
// @route   POST /api/matches
// @access  Private/Admin
const createMatch = async (req, res) => {
  try {
    const {
      tournamentId,
      matchName,
      venue,
      scheduledDate,
      scheduledTime,
      teamA,
      teamB,
      playersA,
      playersB,
      gameDuration,
      shotClockDuration,
      targetScore,
      foulLimit,
    } = req.body;

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

    // Verify teams exist
    const teamADoc = await Team.findById(teamA);
    const teamBDoc = await Team.findById(teamB);

    if (!teamADoc || !teamBDoc) {
      return res.status(404).json({
        success: false,
        message: 'One or both selected teams could not be found',
      });
    }

    // Format playersA and playersB
    let formattedPlayersA = [];
    if (playersA && Array.isArray(playersA) && playersA.length > 0) {
      const pDocs = await Player.find({ _id: { $in: playersA } });
      formattedPlayersA = pDocs.map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
      }));
    } else {
      // Auto-populate from team players if not explicitly passed
      const pDocs = await Player.find({ teamId: teamA }).limit(4);
      formattedPlayersA = pDocs.map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
      }));
    }

    let formattedPlayersB = [];
    if (playersB && Array.isArray(playersB) && playersB.length > 0) {
      const pDocs = await Player.find({ _id: { $in: playersB } });
      formattedPlayersB = pDocs.map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
      }));
    } else {
      const pDocs = await Player.find({ teamId: teamB }).limit(4);
      formattedPlayersB = pDocs.map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
      }));
    }

    // Initialize player stats entries for box score
    const initialPlayerStats = [
      ...formattedPlayersA.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamA,
        team: 'A',
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
      })),
      ...formattedPlayersB.map((p) => ({
        playerId: p.player,
        playerName: p.name,
        jerseyNumber: p.jerseyNumber,
        teamId: teamB,
        team: 'B',
        points: 0,
        onePoints: 0,
        twoPoints: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
      })),
    ];

    const matchDurationSec = gameDuration ? Number(gameDuration) : 600;
    const shotClockSec = shotClockDuration ? Number(shotClockDuration) : 12;

    const match = await Match.create({
      tournamentId: tournamentId || null,
      matchName,
      venue: venue || 'Main Court 3x3',
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || '18:00',
      teamA,
      teamB,
      playersA: formattedPlayersA,
      playersB: formattedPlayersB,
      gameDuration: matchDurationSec,
      remainingTime: matchDurationSec,
      shotClockDuration: shotClockSec,
      shotClockRemaining: shotClockSec,
      targetScore: targetScore ? Number(targetScore) : 21,
      foulLimit: foulLimit ? Number(foulLimit) : 7,
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

// @desc    Get match summary & printable report
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
      matchName: match.matchName,
      tournament: match.tournamentId ? match.tournamentId.name : 'Exhibition Match',
      venue: match.venue,
      status: match.status,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      durationMinutes: match.duration ? Math.round(match.duration / 60) : 10,
      teamA: {
        name: match.teamA.name,
        shortName: match.teamA.shortName,
        score: match.scoreA,
        fouls: match.foulsA,
        coach: match.teamA.coach,
      },
      teamB: {
        name: match.teamB.name,
        shortName: match.teamB.shortName,
        score: match.scoreB,
        fouls: match.foulsB,
        coach: match.teamB.coach,
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
