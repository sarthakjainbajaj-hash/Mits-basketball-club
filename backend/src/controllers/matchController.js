const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Team = require('../models/Team');
const Player = require('../models/Player');
const User = require('../models/User');
const ScoreAuditLog = require('../models/ScoreAuditLog');

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
      .populate('assignedScorer', 'name email role')
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
      .populate('teamB_roster.substitutes.player', 'name jerseyNumber position profileImage')
      .populate('assignedScorer', 'name email role');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Auto-sync newly registered players from team directory for SCHEDULED matches
    if (match.status === 'SCHEDULED' && match.teamA && match.teamB) {
      try {
        const teamAId = match.teamA._id || match.teamA;
        const teamBId = match.teamB._id || match.teamB;
        const [teamAPlayers, teamBPlayers] = await Promise.all([
          Player.find({ teamId: teamAId }),
          Player.find({ teamId: teamBId }),
        ]);

        let modified = false;
        const starterAIds = (match.teamA_roster?.starters || []).map((p) => (p.player?._id || p.player || '').toString());
        const subAIds = (match.teamA_roster?.substitutes || []).map((p) => (p.player?._id || p.player || '').toString());
        for (const p of teamAPlayers) {
          const pid = p._id.toString();
          if (!starterAIds.includes(pid) && !subAIds.includes(pid)) {
            match.teamA_roster.substitutes.push({
              player: p._id,
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              position: p.position || 'Guard',
            });
            match.playersA.push({
              player: p._id,
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              position: p.position || 'Guard',
            });
            if (!match.playerStats.some((s) => (s.playerId?._id || s.playerId || '').toString() === pid)) {
              match.playerStats.push({
                playerId: p._id,
                playerName: p.name,
                jerseyNumber: p.jerseyNumber,
                teamId: teamAId,
                team: 'A',
                isStarter: false,
                isActive: false,
                points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0,
              });
            }
            modified = true;
          }
        }

        const starterBIds = (match.teamB_roster?.starters || []).map((p) => (p.player?._id || p.player || '').toString());
        const subBIds = (match.teamB_roster?.substitutes || []).map((p) => (p.player?._id || p.player || '').toString());
        for (const p of teamBPlayers) {
          const pid = p._id.toString();
          if (!starterBIds.includes(pid) && !subBIds.includes(pid)) {
            match.teamB_roster.substitutes.push({
              player: p._id,
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              position: p.position || 'Guard',
            });
            match.playersB.push({
              player: p._id,
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              position: p.position || 'Guard',
            });
            if (!match.playerStats.some((s) => (s.playerId?._id || s.playerId || '').toString() === pid)) {
              match.playerStats.push({
                playerId: p._id,
                playerName: p.name,
                jerseyNumber: p.jerseyNumber,
                teamId: teamBId,
                team: 'B',
                isStarter: false,
                isActive: false,
                points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0,
              });
            }
            modified = true;
          }
        }

        if (modified) {
          await match.save();
        }
      } catch (syncErr) {
        console.error('Non-blocking roster auto-sync error in getMatchById:', syncErr);
      }
    }

    const events = await MatchEvent.find({ matchId: match._id }).sort({ timestamp: 1 });

    const responseData = match.toObject();
    responseData.serverTime = Date.now();
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
      assignedScorer,
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

    let finalAStarters = [...teamA_starters];
    let finalASubs = [...teamA_substitutes];
    let finalBStarters = [...teamB_starters];
    let finalBSubs = [...teamB_substitutes];

    const reqStarters = matchType === '3x3' ? 3 : 5;

    // Auto-resolve rosters from team registered players if not explicitly passed (e.g. tournament match fixture)
    if (finalAStarters.length === 0) {
      let teamAPlayers = await Player.find({ teamId: teamA });
      if (teamAPlayers.length < reqStarters) {
        const teamObj = await Team.findById(teamA);
        const tName = teamObj ? teamObj.name : 'Team A';
        const needed = reqStarters - teamAPlayers.length;
        for (let i = 1; i <= needed; i++) {
          const np = await Player.create({
            teamId: teamA,
            name: `${tName} Player ${teamAPlayers.length + 1}`,
            jerseyNumber: teamAPlayers.length + 10,
            position: 'Forward',
          });
          teamAPlayers.push(np);
        }
      }
      finalAStarters = teamAPlayers.slice(0, reqStarters).map((p) => p._id);
      finalASubs = teamAPlayers.slice(reqStarters).map((p) => p._id);
    }

    if (finalBStarters.length === 0) {
      let teamBPlayers = await Player.find({ teamId: teamB });
      if (teamBPlayers.length < reqStarters) {
        const teamObj = await Team.findById(teamB);
        const tName = teamObj ? teamObj.name : 'Team B';
        const needed = reqStarters - teamBPlayers.length;
        for (let i = 1; i <= needed; i++) {
          const np = await Player.create({
            teamId: teamB,
            name: `${tName} Player ${teamBPlayers.length + 1}`,
            jerseyNumber: teamBPlayers.length + 10,
            position: 'Forward',
          });
          teamBPlayers.push(np);
        }
      }
      finalBStarters = teamBPlayers.slice(0, reqStarters).map((p) => p._id);
      finalBSubs = teamBPlayers.slice(reqStarters).map((p) => p._id);
    }

    // Official Roster Validation: Require starters only. Substitutes have NO restriction (0 to any number)!
    if (matchType === '3x3') {
      if (finalAStarters.length !== 3) {
        return res.status(400).json({
          success: false,
          message: '3x3 requires 3 starting players for Team A.',
        });
      }
      if (finalBStarters.length !== 3) {
        return res.status(400).json({
          success: false,
          message: '3x3 requires 3 starting players for Team B.',
        });
      }
    } else {
      if (finalAStarters.length !== 5) {
        return res.status(400).json({
          success: false,
          message: '5x5 requires 5 starting players for Team A.',
        });
      }
      if (finalBStarters.length !== 5) {
        return res.status(400).json({
          success: false,
          message: '5x5 requires 5 starting players for Team B.',
        });
      }
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

    const formattedAStarters = await formatPlayerList(finalAStarters);
    const formattedASubs = await formatPlayerList(finalASubs);
    const formattedBStarters = await formatPlayerList(finalBStarters);
    const formattedBSubs = await formatPlayerList(finalBSubs);

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

    // Compute format-dependent settings (Quarters vs Halves, timing, shot clock)
    const matchStructure = settings.matchStructure || (matchType === '5x5' ? 'QUARTERS' : 'SINGLE');
    const quarterDuration = Number(settings.quarterDuration) || Number(settings.gameDuration) || (matchType === '3x3' ? 600 : (matchStructure === 'HALVES' ? 900 : 600));
    const shotClock = settings.shotClock !== undefined ? Number(settings.shotClock) : (matchType === '3x3' ? 12 : 24);

    const matchSettings = {
      matchStructure,
      gameDuration: quarterDuration,
      shotClock,
      targetScore: settings.targetScore !== undefined ? settings.targetScore : matchType === '3x3' ? 21 : 0,
      numberOfQuarters: matchStructure === 'HALVES' ? 2 : (matchType === '3x3' ? 1 : 4),
      quarterDuration,
      foulLimit: settings.foulLimit || (matchType === '3x3' ? 7 : 5),
      timeoutDuration: Number(settings.timeoutDuration) || 60,
    };

    const initialPeriod = matchType === '3x3' ? 'REGULATION' : (matchStructure === 'HALVES' ? 'H1' : 'Q1');

    let validScorerId = null;
    const scorerHistory = [];
    if (assignedScorer) {
      const userScorer = await User.findById(assignedScorer);
      if (userScorer && ['scorer', 'admin', 'superadmin'].includes(userScorer.role)) {
        validScorerId = userScorer._id;
        scorerHistory.push({
          scorer: userScorer._id,
          assignedBy: req.user._id,
          assignedAt: new Date(),
        });
      }
    }

    const match = await Match.create({
      matchType,
      tournamentId: tournamentId || null,
      matchName,
      venue: venue || (matchType === '3x3' ? '3x3 Center Court' : 'Main Arena Court'),
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || '18:00',
      teamA,
      teamB,
      assignedScorer: validScorerId,
      assignedScorerHistory: scorerHistory,
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
      timeoutDuration: matchSettings.timeoutDuration,
      currentPeriod: initialPeriod,
      periodScores: [{ period: initialPeriod, scoreA: 0, scoreB: 0 }],
      timeoutsA: matchType === '5x5' ? 5 : 1,
      timeoutsB: matchType === '5x5' ? 5 : 1,
      status: 'SCHEDULED',
      playerStats: initialPlayerStats,
    });

    if (tournamentId) {
      try {
        const Tournament = require('../models/Tournament');
        await Tournament.findByIdAndUpdate(tournamentId, {
          $addToSet: { teams: { $each: [teamA, teamB] } },
        });
      } catch (tErr) {
        console.error('Non-blocking tournament team auto-registration error:', tErr);
      }
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue')
      .populate('assignedScorer', 'name email role');

    res.status(201).json({ success: true, data: populatedMatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update match settings / details (Allowlisted to prevent Mass Assignment)
// @route   PUT /api/matches/:id
// @access  Private/Admin
const updateMatch = async (req, res) => {
  try {
    const matchToUpdate = await Match.findById(req.params.id);
    if (!matchToUpdate) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Explicit field allowlist to strictly prevent Mass Assignment vulnerabilities
    const allowedFields = [
      'matchName',
      'venue',
      'scheduledDate',
      'scheduledTime',
      'assignedScorer',
      'gameDuration',
      'remainingTime',
      'shotClockDuration',
      'shotClockRemaining',
      'targetScore',
      'foulLimit',
      'timeoutDuration',
      'currentPeriod',
      'settings',
    ];

    const safeUpdate = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        safeUpdate[key] = req.body[key];
      }
    }

    // Scorer reassignment check
    if (req.body.assignedScorer !== undefined) {
      if (req.body.assignedScorer) {
        const scorerUser = await User.findById(req.body.assignedScorer);
        if (!scorerUser || !['scorer', 'admin', 'superadmin'].includes(scorerUser.role)) {
          return res.status(400).json({ success: false, message: 'Assigned scorer must be an active scorer or admin' });
        }
        safeUpdate.assignedScorer = scorerUser._id;
        matchToUpdate.assignedScorerHistory.push({
          scorer: scorerUser._id,
          assignedBy: req.user._id,
          assignedAt: new Date(),
        });
      } else {
        safeUpdate.assignedScorer = null;
        matchToUpdate.assignedScorerHistory.push({
          scorer: null,
          assignedBy: req.user._id,
          assignedAt: new Date(),
        });
      }
      safeUpdate.assignedScorerHistory = matchToUpdate.assignedScorerHistory;
    }

    // If match is still scheduled, sync remainingTime if quarterDuration or gameDuration is updated
    if (matchToUpdate.status === 'SCHEDULED') {
      const qDur = req.body['settings.quarterDuration'] || req.body.settings?.quarterDuration || req.body.gameDuration || req.body.quarterDuration;
      if (qDur && !isNaN(Number(qDur))) {
        safeUpdate.remainingTime = Number(qDur);
        safeUpdate.gameDuration = Number(qDur);
      }
      const sClock = req.body['settings.shotClock'] || req.body.settings?.shotClock || req.body.shotClock;
      if (sClock !== undefined && !isNaN(Number(sClock))) {
        safeUpdate.shotClockRemaining = Number(sClock);
        safeUpdate.shotClockDuration = Number(sClock);
      }
      const struct = req.body['settings.matchStructure'] || req.body.settings?.matchStructure || req.body.matchStructure;
      if (struct === 'HALVES' && matchToUpdate.currentPeriod === 'Q1') {
        safeUpdate.currentPeriod = 'H1';
      } else if (struct === 'QUARTERS' && matchToUpdate.currentPeriod === 'H1') {
        safeUpdate.currentPeriod = 'Q1';
      }
    }

    const match = await Match.findByIdAndUpdate(req.params.id, { $set: safeUpdate }, {
      new: true,
      runValidators: true,
    })
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue')
      .populate('assignedScorer', 'name email role');

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign or reassign an official scorer to a match
// @route   PUT /api/matches/:id/assign-scorer
// @access  Private (Admin, Super Admin)
const assignMatchScorer = async (req, res) => {
  try {
    const { scorerId } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    let targetScorer = null;
    if (scorerId) {
      targetScorer = await User.findById(scorerId);
      if (!targetScorer) {
        return res.status(404).json({ success: false, message: 'Scorer user not found' });
      }
      if (!['scorer', 'admin', 'superadmin'].includes(targetScorer.role)) {
        return res.status(400).json({ success: false, message: 'Assigned user must have scorer or admin role' });
      }
    }

    match.assignedScorer = scorerId || null;
    match.assignedScorerHistory.push({
      scorer: scorerId || null,
      assignedBy: req.user._id,
      assignedAt: new Date(),
    });

    await match.save();

    try {
      await ScoreAuditLog.create({
        matchId: match._id,
        tournamentId: match.tournamentId || null,
        operatorId: req.user._id,
        operatorName: req.user.name,
        operatorEmail: req.user.email,
        operatorRole: req.user.role,
        actionType: 'SCORER_ASSIGNMENT',
        previousScoreA: match.scoreA,
        previousScoreB: match.scoreB,
        newScoreA: match.scoreA,
        newScoreB: match.scoreB,
        notes: targetScorer
          ? `Scorer ${targetScorer.name} (${targetScorer.email}) assigned by ${req.user.name}`
          : `Scorer unassigned by ${req.user.name}`,
        ipAddress: req.ip || req.connection?.remoteAddress || '',
        userAgent: req.get('user-agent') || '',
      });
    } catch (aErr) {
      console.error('[Audit Log Error]:', aErr.message);
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue')
      .populate('assignedScorer', 'name email role');

    const io = req.app.get('io');
    if (io) {
      const { broadcastMatchState } = require('../sockets/matchSocket');
      broadcastMatchState(io, match._id.toString(), populatedMatch);
    }

    res.status(200).json({
      success: true,
      message: targetScorer ? `Scorer ${targetScorer.name} assigned successfully` : 'Scorer unassigned',
      data: populatedMatch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete tamper audit log history for a match
// @route   GET /api/matches/:id/audit-logs
// @access  Private (Admin, Super Admin)
const getMatchAuditLogs = async (req, res) => {
  try {
    const logs = await ScoreAuditLog.find({ matchId: req.params.id })
      .populate('operatorId', 'name email role')
      .populate('restoredBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore match score from a tamper-evident audit record
// @route   POST /api/matches/:id/restore-score
// @access  Private (Admin, Super Admin)
const restoreMatchScore = async (req, res) => {
  try {
    const { auditLogId, reason } = req.body;
    if (!auditLogId) {
      return res.status(400).json({ success: false, message: 'auditLogId is required' });
    }

    const logEntry = await ScoreAuditLog.findById(auditLogId);
    if (!logEntry) {
      return res.status(404).json({ success: false, message: 'Audit log record not found' });
    }

    if (logEntry.matchId.toString() !== req.params.id) {
      return res.status(400).json({ success: false, message: 'Audit log entry does not belong to this match' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const prevScoreA = match.scoreA;
    const prevScoreB = match.scoreB;

    const targetScoreA = logEntry.previousScoreA;
    const targetScoreB = logEntry.previousScoreB;

    match.scoreA = targetScoreA;
    match.scoreB = targetScoreB;

    // If match was completed and had persisted stats, update finalScore string
    if (match.status === 'COMPLETED') {
      match.finalScore = `${targetScoreA} - ${targetScoreB}`;
      if (targetScoreA > targetScoreB) {
        match.winner = 'A';
        match.winnerTeamId = match.teamA;
      } else if (targetScoreB > targetScoreA) {
        match.winner = 'B';
        match.winnerTeamId = match.teamB;
      } else {
        match.winner = 'DRAW';
        match.winnerTeamId = null;
      }
    }

    await match.save();

    // Mark original audit log as restored
    logEntry.isRestored = true;
    logEntry.restoredAt = new Date();
    logEntry.restoredBy = req.user._id;
    await logEntry.save();

    // Record new audit entry documenting restoration
    const restorationLog = await ScoreAuditLog.create({
      matchId: match._id,
      tournamentId: match.tournamentId || null,
      operatorId: req.user._id,
      operatorName: req.user.name,
      operatorEmail: req.user.email,
      operatorRole: req.user.role,
      actionType: 'SCORE_RESTORATION',
      previousScoreA: prevScoreA,
      previousScoreB: prevScoreB,
      newScoreA: targetScoreA,
      newScoreB: targetScoreB,
      pointsDelta: (targetScoreA + targetScoreB) - (prevScoreA + prevScoreB),
      notes: reason || `Score manually restored by ${req.user.name} from audit record ${auditLogId}`,
      metadata: { restoredFromLogId: auditLogId },
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .populate('tournamentId', 'name venue')
      .populate('assignedScorer', 'name email role');

    const io = req.app.get('io');
    if (io) {
      const { broadcastMatchState } = require('../sockets/matchSocket');
      broadcastMatchState(io, match._id.toString(), populatedMatch);
    }

    res.status(200).json({
      success: true,
      message: `Match scores successfully restored to ${targetScoreA} - ${targetScoreB}`,
      data: populatedMatch,
      restorationLog,
    });
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
  assignMatchScorer,
  getMatchAuditLogs,
  restoreMatchScore,
};
