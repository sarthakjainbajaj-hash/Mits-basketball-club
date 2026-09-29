const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Player = require('../models/Player');
const Team = require('../models/Team');
const { broadcastMatchState, broadcastBuzzerAlert } = require('../sockets/matchSocket');

// Format seconds into MM:SS display
const formatTime = (seconds) => {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper to fetch fully populated match object with live computed remaining times
const getFullMatchData = async (matchId) => {
  const populatedMatch = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor coach captain viceCaptain')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor coach captain viceCaptain')
    .populate('tournamentId', 'name venue')
    .populate('playersA.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain')
    .populate('playersB.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain')
    .populate('teamA_roster.starters.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain')
    .populate('teamA_roster.substitutes.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain')
    .populate('teamB_roster.starters.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain')
    .populate('teamB_roster.substitutes.player', 'name jerseyNumber position profileImage isCaptain isViceCaptain');

  if (!populatedMatch) return null;

  const responseData = populatedMatch.toObject();
  responseData.remainingTime = populatedMatch.getCurrentRemainingTime();
  responseData.shotClockRemaining = populatedMatch.getCurrentShotClockRemaining();
  return responseData;
};

// Helper to broadcast match update with populated fields
const broadcastState = async (req, match, latestEvent = null) => {
  const io = req.app.get('io');
  if (!io) return;

  const responseData = await getFullMatchData(match._id);
  if (!responseData) return;

  broadcastMatchState(io, match._id.toString(), responseData, latestEvent);
};

// @desc    Start / Resume live match timer
// @route   POST /api/matches/:id/start
// @access  Private (Admin, Scorer)
const startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (match.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot start an already completed match' });
    }

    const now = Date.now();
    match.status = 'LIVE';
    if (!match.startedAt) {
      match.startedAt = new Date();
    }

    match.timerRunning = true;
    match.timerStartedAt = now;
    match.shotClockRunning = true;
    match.shotClockStartedAt = now;
    match.pausedAt = null;

    await match.save();

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'TIMER_START',
      gameTime: formatTime(match.remainingTime),
      metadata: { description: 'Game timer and shot clock started' },
    });

    await broadcastState(req, match, event);
    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pause live match timer
// @route   POST /api/matches/:id/pause
// @access  Private (Admin, Scorer)
const pauseMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (match.timerRunning && match.timerStartedAt) {
      const elapsed = (Date.now() - match.timerStartedAt) / 1000;
      match.remainingTime = Math.max(0, Math.round((match.remainingTime - elapsed) * 10) / 10);
    }

    if (match.shotClockRunning && match.shotClockStartedAt) {
      const scElapsed = (Date.now() - match.shotClockStartedAt) / 1000;
      match.shotClockRemaining = Math.max(0, Math.round((match.shotClockRemaining - scElapsed) * 10) / 10);
    }

    match.timerRunning = false;
    match.timerStartedAt = null;
    match.shotClockRunning = false;
    match.shotClockStartedAt = null;
    match.pausedAt = new Date();
    if (match.status === 'LIVE') {
      match.status = 'PAUSED';
    }

    await match.save();

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'TIMER_PAUSE',
      gameTime: formatTime(match.remainingTime),
      metadata: { description: 'Game timer paused' },
    });

    await broadcastState(req, match, event);
    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset game timer
// @route   POST /api/matches/:id/reset-timer
// @access  Private (Admin, Scorer)
const resetTimer = async (req, res) => {
  try {
    const { duration } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const newDuration = duration !== undefined ? Number(duration) : match.gameDuration;
    match.remainingTime = newDuration;
    match.timerRunning = false;
    match.timerStartedAt = null;

    await match.save();
    await broadcastState(req, match);
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Shot clock controls (reset full, reset short, pause, resume, set)
// @route   POST /api/matches/:id/shot-clock
// @access  Private (Admin, Scorer)
const controlShotClock = async (req, res) => {
  try {
    const { action, seconds } = req.body; // 'RESET_FULL', 'RESET_SHORT', 'RESET_24', 'RESET_14', 'RESET_12', 'RESET_2', 'PAUSE', 'RESUME', 'SET'
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const now = Date.now();
    const fullDuration = match.settings?.shotClock || (match.matchType === '5x5' ? 24 : 12);
    const shortDuration = match.matchType === '5x5' ? 14 : 2;

    if (action === 'RESET_FULL' || action === 'RESET_12' && match.matchType !== '5x5' || action === 'RESET_24') {
      match.shotClockRemaining = action === 'RESET_24' ? 24 : fullDuration;
      match.shotClockStartedAt = match.timerRunning ? now : null;
      match.shotClockRunning = match.timerRunning;
    } else if (action === 'RESET_12') {
      match.shotClockRemaining = 12;
      match.shotClockStartedAt = match.timerRunning ? now : null;
      match.shotClockRunning = match.timerRunning;
    } else if (action === 'RESET_SHORT' || action === 'RESET_14' || action === 'RESET_2') {
      match.shotClockRemaining = action === 'RESET_14' ? 14 : (action === 'RESET_2' ? 2 : shortDuration);
      match.shotClockStartedAt = match.timerRunning ? now : null;
      match.shotClockRunning = match.timerRunning;
    } else if (action === 'SET' && seconds !== undefined) {
      match.shotClockRemaining = Number(seconds);
      match.shotClockStartedAt = match.shotClockRunning ? now : null;
    } else if (action === 'PAUSE') {
      if (match.shotClockRunning && match.shotClockStartedAt) {
        const scElapsed = (now - match.shotClockStartedAt) / 1000;
        match.shotClockRemaining = Math.max(0, Math.round((match.shotClockRemaining - scElapsed) * 10) / 10);
      }
      match.shotClockRunning = false;
      match.shotClockStartedAt = null;
    } else if (action === 'RESUME') {
      match.shotClockRunning = true;
      match.shotClockStartedAt = now;
    }

    await match.save();

    const io = req.app.get('io');
    if (match.shotClockRemaining === 0) {
      broadcastBuzzerAlert(io, match._id.toString(), 'SHOT_CLOCK', { message: 'Shot Clock Expired' });
    }

    await broadcastState(req, match);
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update match score (+1, +2, +3, -1, -2, -3) with player attribution
// @route   POST /api/matches/:id/score
// @access  Private (Admin, Scorer)
const updateScore = async (req, res) => {
  try {
    const { team, points, playerId } = req.body; // team: 'A' | 'B', points: 1 | 2 | 3 | -1 | -2 | -3

    if (!['A', 'B'].includes(team) || points === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid team or points payload' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (match.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot modify score on a completed match' });
    }

    const numPoints = Number(points);
    const prevScoreA = match.scoreA;
    const prevScoreB = match.scoreB;

    let scorerPlayer = null;
    let scorerName = `Team ${team}`;
    let jerseyNum = null;

    if (playerId) {
      try {
        scorerPlayer = await Player.findById(playerId);
      } catch (e) {
        // Not a standard MongoDB ObjectId, will match via playerStats below
      }

      if (scorerPlayer) {
        scorerName = scorerPlayer.name;
        jerseyNum = scorerPlayer.jerseyNumber;
      }
    }

    // Apply team score change
    if (team === 'A') {
      match.scoreA = Math.max(0, match.scoreA + numPoints);
    } else {
      match.scoreB = Math.max(0, match.scoreB + numPoints);
    }

    // Ensure playerStats array exists
    if (!match.playerStats) {
      match.playerStats = [];
    }

    // Update in-match player stats
    if (playerId) {
      const pidStr = playerId.toString();
      let statEntry = match.playerStats.find((s) => {
        const sId = s.playerId ? (s.playerId._id || s.playerId).toString() : '';
        return sId === pidStr;
      });

      // Secondary match by name and team if ID didn't match directly
      if (!statEntry && scorerPlayer) {
        statEntry = match.playerStats.find(
          (s) => s.team === team && s.playerName.trim().toLowerCase() === scorerPlayer.name.trim().toLowerCase()
        );
      }

      if (statEntry) {
        statEntry.points = Math.max(0, statEntry.points + numPoints);
        if (numPoints === 1) {
          statEntry.onePoints = Math.max(0, statEntry.onePoints + 1);
        } else if (numPoints === 2) {
          statEntry.twoPoints = Math.max(0, statEntry.twoPoints + 1);
        } else if (numPoints === 3) {
          statEntry.threePoints = Math.max(0, (statEntry.threePoints || 0) + 1);
        } else if (numPoints === -1 && statEntry.onePoints > 0) {
          statEntry.onePoints = Math.max(0, statEntry.onePoints - 1);
        } else if (numPoints === -2 && statEntry.twoPoints > 0) {
          statEntry.twoPoints = Math.max(0, statEntry.twoPoints - 1);
        } else if (numPoints === -3 && (statEntry.threePoints || 0) > 0) {
          statEntry.threePoints = Math.max(0, (statEntry.threePoints || 0) - 1);
        }
      } else if (scorerPlayer) {
        match.playerStats.push({
          playerId: scorerPlayer._id,
          playerName: scorerPlayer.name,
          jerseyNumber: scorerPlayer.jerseyNumber,
          teamId: scorerPlayer.teamId || (team === 'A' ? match.teamA : match.teamB),
          team,
          isStarter: true,
          isActive: true,
          points: Math.max(0, numPoints),
          onePoints: numPoints === 1 ? 1 : 0,
          twoPoints: numPoints === 2 ? 1 : 0,
          threePoints: numPoints === 3 ? 1 : 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          fouls: 0,
        });
      }
    }

    // Create MatchEvent for undo and timeline
    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'SCORE',
      team,
      playerId: scorerPlayer ? scorerPlayer._id : (playerId || null),
      playerName: scorerName,
      jerseyNumber: jerseyNum,
      points: numPoints,
      period: match.currentPeriod || '',
      gameTime: formatTime(match.getCurrentRemainingTime()),
      metadata: {
        prevScoreA,
        prevScoreB,
        newScoreA: match.scoreA,
        newScoreB: match.scoreB,
        description: `${scorerName} ${numPoints > 0 ? `+${numPoints}` : numPoints} PTS (${team === 'A' ? match.scoreA : match.scoreB})`,
      },
    });

    // Check 3x3 Sudden Victory: Only for 3x3 format when target score reached (default 21)
    let autoCompleted = false;
    const target = match.targetScore || (match.matchType === '3x3' ? 21 : 0);
    if (match.matchType === '3x3' && target > 0 && (match.scoreA >= target || match.scoreB >= target)) {
      match.status = 'COMPLETED';
      match.endedAt = new Date();
      match.timerRunning = false;
      match.shotClockRunning = false;
      match.winner = match.scoreA >= target ? 'A' : 'B';
      match.winnerTeamId = match.scoreA >= target ? match.teamA : match.teamB;
      match.finalScore = `${match.scoreA} - ${match.scoreB}`;
      autoCompleted = true;

      // Broadcast Game End Buzzer
      const io = req.app.get('io');
      if (io) {
        broadcastBuzzerAlert(io, match._id.toString(), 'GAME_END', {
          winner: match.winner,
          finalScore: match.finalScore,
        });
      }
    }

    await match.save();

    // Broadcast and return fully populated state
    const responseData = await getFullMatchData(match._id);
    const io = req.app.get('io');
    if (io && responseData) {
      broadcastMatchState(io, match._id.toString(), responseData, event);
    }

    res.status(200).json({
      success: true,
      data: responseData || match,
      event,
      autoCompleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record team/player foul (+1, -1)
// @route   POST /api/matches/:id/foul
// @access  Private (Admin, Scorer)
const recordFoul = async (req, res) => {
  try {
    const { team, change, playerId } = req.body; // change: 1 | -1

    if (!['A', 'B'].includes(team) || change === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid team or foul change' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    // Active Player Validation
    if (playerId) {
      const roster = team === 'A' ? match.teamA_roster : match.teamB_roster;
      if (roster && roster.starters && roster.starters.length > 0) {
        const isActivePlayer = roster.starters.some(
          (p) => p.player.toString() === playerId.toString()
        );
        if (!isActivePlayer) {
          return res.status(400).json({
            success: false,
            message: 'Cannot record foul for a bench player. Substitute player into the game first.',
          });
        }
      }
    }

    const numChange = Number(change);
    const prevFoulsA = match.foulsA;
    const prevFoulsB = match.foulsB;

    let foulerPlayer = null;
    let foulerName = `Team ${team}`;
    let jerseyNum = null;

    if (playerId) {
      foulerPlayer = await Player.findById(playerId);
      if (foulerPlayer) {
        foulerName = foulerPlayer.name;
        jerseyNum = foulerPlayer.jerseyNumber;
      }
    }

    if (team === 'A') {
      match.foulsA = Math.max(0, match.foulsA + numChange);
    } else {
      match.foulsB = Math.max(0, match.foulsB + numChange);
    }

    // Update in-match player stats for fouls
    if (playerId && match.playerStats) {
      let statEntry = match.playerStats.find((s) => s.playerId.toString() === playerId.toString());
      if (statEntry) {
        statEntry.fouls = Math.max(0, statEntry.fouls + numChange);
      }
    }

    const currentFouls = team === 'A' ? match.foulsA : match.foulsB;
    const foulThreshold = match.matchType === '5x5' ? 5 : (match.foulLimit || 7);
    const isPenalty = currentFouls >= foulThreshold;
    const isDoublePenalty = match.matchType === '3x3' ? currentFouls >= 10 : false;

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'FOUL',
      team,
      playerId: foulerPlayer ? foulerPlayer._id : null,
      playerName: foulerName,
      jerseyNumber: jerseyNum,
      period: match.currentPeriod || '',
      gameTime: formatTime(match.getCurrentRemainingTime()),
      metadata: {
        prevFoulsA,
        prevFoulsB,
        newFouls: currentFouls,
        isPenalty,
        isDoublePenalty,
        description: `${foulerName} Foul (${currentFouls})${isDoublePenalty ? ' - DOUBLE BONUS (2 FT + Ball)' : isPenalty ? ' - BONUS (Penalty FTs)' : ''}`,
      },
    });

    await match.save();
    await broadcastState(req, match, event);

    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle possession (← Team A / Team B →)
// @route   POST /api/matches/:id/possession
// @access  Private (Admin, Scorer)
const togglePossession = async (req, res) => {
  try {
    const { possession } = req.body; // 'A', 'B', or toggle if omitted
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const prevPossession = match.possession;
    let nextPossession;

    if (possession !== undefined) {
      nextPossession = possession;
    } else {
      nextPossession = match.possession === 'A' ? 'B' : 'A';
    }

    match.possession = nextPossession;
    await match.save();

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'POSSESSION',
      team: nextPossession,
      gameTime: formatTime(match.getCurrentRemainingTime()),
      metadata: {
        prevPossession,
        newPossession: nextPossession,
        description: `Possession awarded to Team ${nextPossession}`,
      },
    });

    await broadcastState(req, match, event);
    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Call Timeout for Team A or Team B
// @route   POST /api/matches/:id/timeout
// @access  Private (Admin, Scorer)
const callTimeout = async (req, res) => {
  try {
    const { team } = req.body;
    if (!['A', 'B'].includes(team)) {
      return res.status(400).json({ success: false, message: 'Valid team (A or B) is required' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (team === 'A') {
      if (match.timeoutsA <= 0) {
        return res.status(400).json({ success: false, message: 'Team A has no timeouts remaining' });
      }
      match.timeoutsA -= 1;
    } else {
      if (match.timeoutsB <= 0) {
        return res.status(400).json({ success: false, message: 'Team B has no timeouts remaining' });
      }
      match.timeoutsB -= 1;
    }

    // Auto-pause timer when timeout is called
    match.timerRunning = false;
    match.timerStartedAt = null;
    match.shotClockRunning = false;
    match.shotClockStartedAt = null;
    match.status = 'PAUSED';

    await match.save();

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'TIMEOUT',
      team,
      gameTime: formatTime(match.getCurrentRemainingTime()),
      metadata: {
        description: `Timeout called by Team ${team} (${team === 'A' ? match.timeoutsA : match.timeoutsB} left)`,
      },
    });

    // Whistle buzzer for timeout
    const io = req.app.get('io');
    broadcastBuzzerAlert(io, match._id.toString(), 'WHISTLE', { message: `Timeout Team ${team}` });

    await broadcastState(req, match, event);
    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record player stats (rebounds, assists, steals, blocks)
// @route   POST /api/matches/:id/player-stats
// @access  Private (Admin, Scorer)
const recordPlayerStat = async (req, res) => {
  try {
    const { playerId, statType, change } = req.body; // statType: 'rebounds'|'assists'|'steals'|'blocks', change: 1 | -1

    if (!playerId || !statType) {
      return res.status(400).json({ success: false, message: 'Player ID and statType are required' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    // Active Player Validation
    const startersA = match.teamA_roster?.starters || [];
    const startersB = match.teamB_roster?.starters || [];
    const pidStr = playerId.toString();

    let player = null;
    try {
      player = await Player.findById(playerId);
    } catch (e) {}

    let statEntry = match.playerStats.find((s) => {
      const sId = s.playerId ? (s.playerId._id || s.playerId).toString() : '';
      return sId === pidStr;
    });

    const delta = change !== undefined ? Number(change) : 1;

    if (!statEntry && player) {
      const isTeamA = match.playersA.some((p) => (p.player?._id || p.player || '').toString() === pidStr) ||
        startersA.some((p) => (p.player?._id || p.player || '').toString() === pidStr);
      statEntry = {
        playerId: player._id,
        playerName: player.name,
        jerseyNumber: player.jerseyNumber,
        teamId: player.teamId,
        team: isTeamA ? 'A' : 'B',
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
      };
      match.playerStats.push(statEntry);
    }

    if (statEntry && statEntry[statType] !== undefined) {
      statEntry[statType] = Math.max(0, statEntry[statType] + delta);
    }

    const event = await MatchEvent.create({
      matchId: match._id,
      type: statType.toUpperCase(),
      team: statEntry?.team || 'A',
      playerId: player ? player._id : playerId,
      playerName: player?.name || statEntry?.playerName || 'Player',
      jerseyNumber: player?.jerseyNumber ?? statEntry?.jerseyNumber,
      period: match.currentPeriod || '',
      gameTime: formatTime(match.getCurrentRemainingTime()),
      metadata: {
        statType,
        delta,
        newValue: statEntry ? statEntry[statType] : delta,
        description: `${player?.name || statEntry?.playerName || 'Player'} ${statType.slice(0, -1).toUpperCase()} (+${delta})`,
      },
    });

    await match.save();
    
    const responseData = await getFullMatchData(match._id);
    const io = req.app.get('io');
    if (io && responseData) {
      broadcastMatchState(io, match._id.toString(), responseData, event);
    }

    res.status(200).json({ success: true, data: responseData || match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Substitute player in/out
// @route   POST /api/matches/:id/substitute
// @access  Private (Admin, Scorer)
const substitutePlayer = async (req, res) => {
  try {
    const { team, playerOutId, playerInId } = req.body;
    if (!['A', 'B'].includes(team) || !playerOutId || !playerInId) {
      return res.status(400).json({
        success: false,
        message: 'Valid team (A or B), playerOutId, and playerInId are required',
      });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (match.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot substitute on a completed match' });
    }

    const rosterKey = team === 'A' ? 'teamA_roster' : 'teamB_roster';
    const roster = match[rosterKey];

    if (!roster || !roster.starters || !roster.substitutes) {
      return res.status(400).json({
        success: false,
        message: 'Team roster is not configured with starters and substitutes',
      });
    }

    // Find outgoing player in starters
    const starterIndex = roster.starters.findIndex(
      (p) => p.player.toString() === playerOutId.toString()
    );
    if (starterIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Outgoing player is not currently in the active on-court lineup',
      });
    }

    // Find incoming player in substitutes
    const subIndex = roster.substitutes.findIndex(
      (p) => p.player.toString() === playerInId.toString()
    );
    if (subIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Incoming player is not currently on the bench',
      });
    }

    const outgoing = roster.starters[starterIndex];
    const incoming = roster.substitutes[subIndex];

    // Swap starters <-> substitutes
    roster.starters.splice(starterIndex, 1, incoming);
    roster.substitutes.splice(subIndex, 1, outgoing);

    // Update active court status in playerStats
    if (match.playerStats) {
      const outStat = match.playerStats.find(
        (s) => s.playerId.toString() === playerOutId.toString()
      );
      if (outStat) {
        outStat.isActive = false;
      }
      let inStat = match.playerStats.find(
        (s) => s.playerId.toString() === playerInId.toString()
      );
      if (inStat) {
        inStat.isActive = true;
      } else {
        match.playerStats.push({
          playerId: incoming.player,
          playerName: incoming.name,
          jerseyNumber: incoming.jerseyNumber,
          teamId: team === 'A' ? match.teamA : match.teamB,
          team,
          isStarter: false,
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
        });
      }
    }

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'SUBSTITUTION',
      team,
      playerOut: outgoing.player,
      playerIn: incoming.player,
      playerName: `${incoming.name} IN for ${outgoing.name}`,
      gameTime: formatTime(match.getCurrentRemainingTime()),
      period: match.currentPeriod || '',
      metadata: {
        playerOutId: outgoing.player,
        playerInId: incoming.player,
        playerOutName: outgoing.name,
        playerInName: incoming.name,
        playerOutJersey: outgoing.jerseyNumber,
        playerInJersey: incoming.jerseyNumber,
        team,
        description: `Sub: #${incoming.jerseyNumber} ${incoming.name} IN for #${outgoing.jerseyNumber} ${outgoing.name}`,
      },
    });

    await match.save();
    await broadcastState(req, match, event);

    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Control match quarter / period (END_QUARTER, NEXT_QUARTER, SET_PERIOD)
// @route   POST /api/matches/:id/period
// @access  Private (Admin, Scorer)
const controlPeriod = async (req, res) => {
  try {
    const { action, period } = req.body; // 'END_QUARTER' | 'NEXT_QUARTER' | 'SET_PERIOD'
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (action === 'END_QUARTER') {
      // Pause timer
      if (match.timerRunning && match.timerStartedAt) {
        const elapsed = (Date.now() - match.timerStartedAt) / 1000;
        match.remainingTime = Math.max(0, Math.round((match.remainingTime - elapsed) * 10) / 10);
      }
      match.timerRunning = false;
      match.timerStartedAt = null;
      match.shotClockRunning = false;
      match.shotClockStartedAt = null;
      match.status = 'PAUSED';

      // Compute quarter score for completed period
      const prevA = (match.periodScores || []).reduce((acc, p) => acc + (p.scoreA || 0), 0);
      const prevB = (match.periodScores || []).reduce((acc, p) => acc + (p.scoreB || 0), 0);
      const quarterScoreA = Math.max(0, match.scoreA - prevA);
      const quarterScoreB = Math.max(0, match.scoreB - prevB);

      const currentPeriodName = match.currentPeriod || 'Q1';
      const existingPeriodIdx = (match.periodScores || []).findIndex(
        (p) => p.period === currentPeriodName
      );
      if (existingPeriodIdx >= 0) {
        match.periodScores[existingPeriodIdx].scoreA = quarterScoreA;
        match.periodScores[existingPeriodIdx].scoreB = quarterScoreB;
      } else {
        match.periodScores.push({
          period: currentPeriodName,
          scoreA: quarterScoreA,
          scoreB: quarterScoreB,
        });
      }

      const event = await MatchEvent.create({
        matchId: match._id,
        type: 'PERIOD_END',
        period: currentPeriodName,
        gameTime: formatTime(match.remainingTime),
        metadata: {
          period: currentPeriodName,
          quarterScoreA,
          quarterScoreB,
          totalScoreA: match.scoreA,
          totalScoreB: match.scoreB,
          description: `End of ${currentPeriodName} (${match.scoreA} - ${match.scoreB})`,
        },
      });

      const io = req.app.get('io');
      broadcastBuzzerAlert(io, match._id.toString(), 'PERIOD_END', {
        period: currentPeriodName,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
      });

      await match.save();
      await broadcastState(req, match, event);
      return res.status(200).json({ success: true, data: match, event });
    } else if (action === 'NEXT_QUARTER') {
      const current = match.currentPeriod || 'Q1';
      let nextPeriod = 'Q2';
      if (current === 'Q1') nextPeriod = 'Q2';
      else if (current === 'Q2') nextPeriod = 'Q3';
      else if (current === 'Q3') nextPeriod = 'Q4';
      else if (current === 'Q4') nextPeriod = 'OT1';
      else if (current.startsWith('OT')) {
        const otNum = parseInt(current.replace('OT', '')) || 1;
        nextPeriod = `OT${otNum + 1}`;
      } else {
        nextPeriod = 'Q2';
      }

      match.currentPeriod = nextPeriod;
      const isOt = nextPeriod.startsWith('OT');
      const quarterSec = isOt ? 300 : (match.settings?.quarterDuration || 600);
      match.remainingTime = quarterSec;
      match.timerRunning = false;
      match.timerStartedAt = null;

      const fullShotClock = match.settings?.shotClock || (match.matchType === '5x5' ? 24 : 12);
      match.shotClockRemaining = fullShotClock;
      match.shotClockRunning = false;
      match.shotClockStartedAt = null;

      // In 5x5 basketball, team fouls reset per quarter
      if (match.matchType === '5x5') {
        match.foulsA = 0;
        match.foulsB = 0;
      }

      const event = await MatchEvent.create({
        matchId: match._id,
        type: 'PERIOD_START',
        period: nextPeriod,
        gameTime: formatTime(match.remainingTime),
        metadata: {
          period: nextPeriod,
          description: `Started ${nextPeriod}`,
        },
      });

      await match.save();
      await broadcastState(req, match, event);
      return res.status(200).json({ success: true, data: match, event });
    } else if (action === 'SET_PERIOD' && period) {
      match.currentPeriod = period;
      await match.save();
      await broadcastState(req, match);
      return res.status(200).json({ success: true, data: match });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid period action' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Undo last action
// @route   POST /api/matches/:id/undo
// @access  Private (Admin, Scorer)
const undoLastAction = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    // Find the latest undoable event
    const lastEvent = await MatchEvent.findOne({
      matchId: match._id,
      type: {
        $in: [
          'SCORE',
          'FOUL',
          'POSSESSION',
          'TIMEOUT',
          'REBOUND',
          'ASSIST',
          'STEAL',
          'BLOCK',
          'SUBSTITUTION',
          'PERIOD_END',
          'PERIOD_START',
        ],
      },
    }).sort({ timestamp: -1 });

    if (!lastEvent) {
      return res.status(400).json({ success: false, message: 'No actions available to undo' });
    }

    // Revert based on event type
    if (lastEvent.type === 'SCORE') {
      if (lastEvent.metadata && lastEvent.metadata.prevScoreA !== undefined) {
        match.scoreA = lastEvent.metadata.prevScoreA;
        match.scoreB = lastEvent.metadata.prevScoreB;
      } else {
        if (lastEvent.team === 'A') match.scoreA = Math.max(0, match.scoreA - lastEvent.points);
        if (lastEvent.team === 'B') match.scoreB = Math.max(0, match.scoreB - lastEvent.points);
      }

      // Revert player stat points
      if (lastEvent.playerId && match.playerStats) {
        const statEntry = match.playerStats.find(
          (s) => s.playerId.toString() === lastEvent.playerId.toString()
        );
        if (statEntry) {
          statEntry.points = Math.max(0, statEntry.points - lastEvent.points);
          if (lastEvent.points === 1) statEntry.onePoints = Math.max(0, statEntry.onePoints - 1);
          if (lastEvent.points === 2) statEntry.twoPoints = Math.max(0, statEntry.twoPoints - 1);
          if (lastEvent.points === 3) statEntry.threePoints = Math.max(0, (statEntry.threePoints || 0) - 1);
        }
      }

      // If match was auto-completed due to target score, revert back to LIVE
      if (
        match.status === 'COMPLETED' &&
        match.matchType === '3x3' &&
        match.scoreA < (match.targetScore || 21) &&
        match.scoreB < (match.targetScore || 21)
      ) {
        match.status = 'LIVE';
        match.winner = null;
        match.winnerTeamId = null;
        match.endedAt = null;
      }
    } else if (lastEvent.type === 'FOUL') {
      if (lastEvent.metadata && lastEvent.metadata.prevFoulsA !== undefined) {
        match.foulsA = lastEvent.metadata.prevFoulsA;
        match.foulsB = lastEvent.metadata.prevFoulsB;
      } else {
        if (lastEvent.team === 'A') match.foulsA = Math.max(0, match.foulsA - 1);
        if (lastEvent.team === 'B') match.foulsB = Math.max(0, match.foulsB - 1);
      }

      if (lastEvent.playerId && match.playerStats) {
        const statEntry = match.playerStats.find(
          (s) => s.playerId.toString() === lastEvent.playerId.toString()
        );
        if (statEntry) statEntry.fouls = Math.max(0, statEntry.fouls - 1);
      }
    } else if (lastEvent.type === 'POSSESSION') {
      if (lastEvent.metadata && lastEvent.metadata.prevPossession !== undefined) {
        match.possession = lastEvent.metadata.prevPossession;
      }
    } else if (lastEvent.type === 'TIMEOUT') {
      if (lastEvent.team === 'A') match.timeoutsA = Math.min(1, match.timeoutsA + 1);
      if (lastEvent.team === 'B') match.timeoutsB = Math.min(1, match.timeoutsB + 1);
    } else if (['REBOUND', 'ASSIST', 'STEAL', 'BLOCK'].includes(lastEvent.type)) {
      const statKey = lastEvent.type.toLowerCase() + 's';
      if (lastEvent.playerId && match.playerStats) {
        const statEntry = match.playerStats.find(
          (s) => s.playerId.toString() === lastEvent.playerId.toString()
        );
        if (statEntry && statEntry[statKey] !== undefined) {
          statEntry[statKey] = Math.max(0, statEntry[statKey] - 1);
        }
      }
    } else if (lastEvent.type === 'SUBSTITUTION') {
      // Revert substitution: swap back
      const team = lastEvent.team;
      const rosterKey = team === 'A' ? 'teamA_roster' : 'teamB_roster';
      const roster = match[rosterKey];
      const incomingId = lastEvent.playerIn?.toString() || lastEvent.metadata?.playerInId?.toString();
      const outgoingId = lastEvent.playerOut?.toString() || lastEvent.metadata?.playerOutId?.toString();

      if (roster && roster.starters && roster.substitutes && incomingId && outgoingId) {
        const curStarterIdx = roster.starters.findIndex(
          (p) => p.player.toString() === incomingId
        );
        const curSubIdx = roster.substitutes.findIndex(
          (p) => p.player.toString() === outgoingId
        );
        if (curStarterIdx >= 0 && curSubIdx >= 0) {
          const revertOutgoing = roster.starters[curStarterIdx];
          const revertIncoming = roster.substitutes[curSubIdx];
          roster.starters.splice(curStarterIdx, 1, revertIncoming);
          roster.substitutes.splice(curSubIdx, 1, revertOutgoing);
        }
      }

      if (match.playerStats) {
        const inStat = match.playerStats.find((s) => s.playerId.toString() === incomingId);
        const outStat = match.playerStats.find((s) => s.playerId.toString() === outgoingId);
        if (inStat) inStat.isActive = false;
        if (outStat) outStat.isActive = true;
      }
    } else if (lastEvent.type === 'PERIOD_END') {
      if (match.periodScores && match.periodScores.length > 0) {
        match.periodScores.pop();
      }
    } else if (lastEvent.type === 'PERIOD_START') {
      const current = match.currentPeriod;
      if (current === 'Q2') match.currentPeriod = 'Q1';
      else if (current === 'Q3') match.currentPeriod = 'Q2';
      else if (current === 'Q4') match.currentPeriod = 'Q3';
      else if (current === 'OT1') match.currentPeriod = 'Q4';
      else if (current && current.startsWith('OT')) {
        const otNum = parseInt(current.replace('OT', '')) || 1;
        match.currentPeriod = otNum > 1 ? `OT${otNum - 1}` : 'Q4';
      }
    }

    // Delete the reverted event from history
    await lastEvent.deleteOne();
    await match.save();

    await broadcastState(req, match);
    res.status(200).json({
      success: true,
      message: `Undid last action: ${lastEvent.type}`,
      data: match,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    End match & persist completed stats
// @route   POST /api/matches/:id/end
// @access  Private (Admin, Scorer)
const endMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    match.status = 'COMPLETED';
    match.endedAt = new Date();
    match.timerRunning = false;
    match.shotClockRunning = false;

    // Calculate winner
    if (match.scoreA > match.scoreB) {
      match.winner = 'A';
      match.winnerTeamId = match.teamA;
    } else if (match.scoreB > match.scoreA) {
      match.winner = 'B';
      match.winnerTeamId = match.teamB;
    } else {
      match.winner = 'DRAW';
      match.winnerTeamId = null;
    }

    match.finalScore = `${match.scoreA} - ${match.scoreB}`;

    // Update Team stats in MongoDB
    const teamA = await Team.findById(match.teamA);
    const teamB = await Team.findById(match.teamB);

    const is3x3 = match.matchType === '3x3';
    const formatKey = is3x3 ? 'matches3x3' : 'matches5x5';

    if (teamA) {
      teamA.stats.played = (teamA.stats.played || 0) + 1;
      teamA.stats.pointsFor = (teamA.stats.pointsFor || 0) + match.scoreA;
      teamA.stats.pointsAgainst = (teamA.stats.pointsAgainst || 0) + match.scoreB;
      if (match.winner === 'A') teamA.stats.wins = (teamA.stats.wins || 0) + 1;
      if (match.winner === 'B') teamA.stats.losses = (teamA.stats.losses || 0) + 1;

      if (!teamA.stats[formatKey]) {
        teamA.stats[formatKey] = { played: 0, wins: 0, losses: 0 };
      }
      teamA.stats[formatKey].played = (teamA.stats[formatKey].played || 0) + 1;
      if (match.winner === 'A') teamA.stats[formatKey].wins = (teamA.stats[formatKey].wins || 0) + 1;
      if (match.winner === 'B') teamA.stats[formatKey].losses = (teamA.stats[formatKey].losses || 0) + 1;

      await teamA.save();
    }

    if (teamB) {
      teamB.stats.played = (teamB.stats.played || 0) + 1;
      teamB.stats.pointsFor = (teamB.stats.pointsFor || 0) + match.scoreB;
      teamB.stats.pointsAgainst = (teamB.stats.pointsAgainst || 0) + match.scoreA;
      if (match.winner === 'B') teamB.stats.wins = (teamB.stats.wins || 0) + 1;
      if (match.winner === 'A') teamB.stats.losses = (teamB.stats.losses || 0) + 1;

      if (!teamB.stats[formatKey]) {
        teamB.stats[formatKey] = { played: 0, wins: 0, losses: 0 };
      }
      teamB.stats[formatKey].played = (teamB.stats[formatKey].played || 0) + 1;
      if (match.winner === 'B') teamB.stats[formatKey].wins = (teamB.stats[formatKey].wins || 0) + 1;
      if (match.winner === 'A') teamB.stats[formatKey].losses = (teamB.stats[formatKey].losses || 0) + 1;

      await teamB.save();
    }

    // Update Player stats in MongoDB
    if (match.playerStats && match.playerStats.length > 0) {
      for (const pStat of match.playerStats) {
        await Player.findByIdAndUpdate(pStat.playerId, {
          $inc: {
            'stats.games': 1,
            'stats.points': pStat.points || 0,
            'stats.onePoints': pStat.onePoints || 0,
            'stats.twoPoints': pStat.twoPoints || 0,
            'stats.threePoints': pStat.threePoints || 0,
            'stats.rebounds': pStat.rebounds || 0,
            'stats.assists': pStat.assists || 0,
            'stats.steals': pStat.steals || 0,
            'stats.blocks': pStat.blocks || 0,
            'stats.fouls': pStat.fouls || 0,
          },
        });
      }
    }

    await match.save();

    const event = await MatchEvent.create({
      matchId: match._id,
      type: 'MATCH_END',
      gameTime: formatTime(match.remainingTime),
      period: match.currentPeriod || '',
      metadata: {
        winner: match.winner,
        finalScore: match.finalScore,
        description: `Match Ended! Final: ${match.finalScore}. Winner: Team ${match.winner}`,
      },
    });

    const io = req.app.get('io');
    broadcastBuzzerAlert(io, match._id.toString(), 'GAME_END', {
      winner: match.winner,
      finalScore: match.finalScore,
    });

    await broadcastState(req, match, event);
    res.status(200).json({ success: true, data: match, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startMatch,
  pauseMatch,
  resetTimer,
  controlShotClock,
  updateScore,
  recordFoul,
  togglePossession,
  callTimeout,
  recordPlayerStat,
  substitutePlayer,
  controlPeriod,
  undoLastAction,
  endMatch,
};
