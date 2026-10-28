const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');

// @desc    Get all tournaments with live status and match counts
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams', 'name shortName logo primaryColor coach')
      .sort({ startDate: -1 })
      .lean();

    // Populate live statuses and match counts
    const tournamentsWithDetails = await Promise.all(
      tournaments.map(async (t) => {
        const matches = await Match.find({ tournamentId: t._id }).select('status');
        let status = t.status || 'UPCOMING';
        if (matches.length > 0) {
          if (matches.some((m) => m.status === 'LIVE' || m.status === 'PAUSED')) {
            status = 'ONGOING';
          } else if (matches.every((m) => m.status === 'COMPLETED')) {
            status = 'COMPLETED';
          } else if (matches.some((m) => m.status === 'COMPLETED')) {
            status = 'ONGOING';
          }
        }
        return {
          ...t,
          status,
          matchCount: matches.length,
          completedCount: matches.filter((m) => m.status === 'COMPLETED').length,
          liveCount: matches.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED').length,
        };
      })
    );

    res.status(200).json({ success: true, count: tournamentsWithDetails.length, data: tournamentsWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tournament by ID with all matches & live status
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      'teams',
      'name shortName logo primaryColor secondaryColor coach'
    );

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Fetch tournament matches
    const matches = await Match.find({ tournamentId: tournament._id })
      .populate('teamA', 'name shortName logo primaryColor secondaryColor')
      .populate('teamB', 'name shortName logo primaryColor secondaryColor')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    // Live calculate status
    let liveStatus = tournament.status || 'UPCOMING';
    if (matches.length > 0) {
      if (matches.some((m) => m.status === 'LIVE' || m.status === 'PAUSED')) {
        liveStatus = 'ONGOING';
      } else if (matches.every((m) => m.status === 'COMPLETED')) {
        liveStatus = 'COMPLETED';
      } else if (matches.some((m) => m.status === 'COMPLETED')) {
        liveStatus = 'ONGOING';
      }

      if (liveStatus !== tournament.status) {
        tournament.status = liveStatus;
        await Tournament.findByIdAndUpdate(tournament._id, { status: liveStatus });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...tournament.toObject(),
        status: liveStatus,
        matches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate tournament standings & points table
// @route   GET /api/tournaments/:id/standings
// @access  Public
const getTournamentStandings = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const completedMatches = await Match.find({
      tournamentId: tournament._id,
      status: 'COMPLETED',
    });

    // Initialize standings map for each registered team
    const standingsMap = {};

    (tournament.teams || []).forEach((team) => {
      if (!team) return;
      const tid = team._id.toString();
      standingsMap[tid] = {
        teamId: team._id,
        teamName: team.name,
        shortName: team.shortName || team.name?.slice(0, 3) || 'TMA',
        logo: team.logo,
        primaryColor: team.primaryColor || '#FF5722',
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        difference: 0,
        pts: 0,
      };
    });

    // Compute stats from completed matches
    for (const m of completedMatches) {
      const teamAId = m.teamA ? (m.teamA._id || m.teamA).toString() : null;
      const teamBId = m.teamB ? (m.teamB._id || m.teamB).toString() : null;

      if (!teamAId || !teamBId) continue;

      // In case a team played but was not in tournament.teams array, fetch and add it dynamically
      if (!standingsMap[teamAId]) {
        const teamDoc = await Team.findById(teamAId);
        if (teamDoc) {
          standingsMap[teamAId] = {
            teamId: teamDoc._id,
            teamName: teamDoc.name,
            shortName: teamDoc.shortName || teamDoc.name?.slice(0, 3) || 'TMA',
            logo: teamDoc.logo,
            primaryColor: teamDoc.primaryColor || '#FF5722',
            played: 0,
            won: 0,
            lost: 0,
            draw: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            difference: 0,
            pts: 0,
          };
        }
      }

      if (!standingsMap[teamBId]) {
        const teamDoc = await Team.findById(teamBId);
        if (teamDoc) {
          standingsMap[teamBId] = {
            teamId: teamDoc._id,
            teamName: teamDoc.name,
            shortName: teamDoc.shortName || teamDoc.name?.slice(0, 3) || 'TMB',
            logo: teamDoc.logo,
            primaryColor: teamDoc.primaryColor || '#06B6D4',
            played: 0,
            won: 0,
            lost: 0,
            draw: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            difference: 0,
            pts: 0,
          };
        }
      }

      const scoreA = Number(m.scoreA) || 0;
      const scoreB = Number(m.scoreB) || 0;

      if (standingsMap[teamAId]) {
        standingsMap[teamAId].played += 1;
        standingsMap[teamAId].pointsFor += scoreA;
        standingsMap[teamAId].pointsAgainst += scoreB;
        if (scoreA > scoreB) {
          standingsMap[teamAId].won += 1;
        } else if (scoreA < scoreB) {
          standingsMap[teamAId].lost += 1;
        } else {
          standingsMap[teamAId].draw += 1;
        }
      }

      if (standingsMap[teamBId]) {
        standingsMap[teamBId].played += 1;
        standingsMap[teamBId].pointsFor += scoreB;
        standingsMap[teamBId].pointsAgainst += scoreA;
        if (scoreB > scoreA) {
          standingsMap[teamBId].won += 1;
        } else if (scoreB < scoreA) {
          standingsMap[teamBId].lost += 1;
        } else {
          standingsMap[teamBId].draw += 1;
        }
      }
    }

    // Convert map to array and calculate points & differential
    const standings = Object.values(standingsMap).map((item) => {
      const difference = item.pointsFor - item.pointsAgainst;
      // Basketball league points: 2 points for Win, 1 point for Draw/Tie
      const pts = (item.won * 2) + item.draw;
      const winPct = item.played > 0 ? (item.won / item.played).toFixed(3) : '.000';
      return {
        ...item,
        difference,
        pts,
        winPct,
      };
    });

    // Sort by: PTS (desc), Won (desc), Difference (desc), PointsFor (desc)
    standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.won !== a.won) return b.won - a.won;
      if (b.difference !== a.difference) return b.difference - a.difference;
      return b.pointsFor - a.pointsFor;
    });

    res.status(200).json({ success: true, data: standings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private/Admin or Scorer
const createTournament = async (req, res) => {
  try {
    const { name, organizer, venue, startDate, endDate, description, teams, format } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tournament name, start date, and end date are required',
      });
    }

    const tournament = await Tournament.create({
      name,
      organizer: organizer || '',
      venue: venue || '',
      startDate,
      endDate,
      description: description || '',
      teams: teams || [],
      format: format || '5x5',
    });

    const populated = await Tournament.findById(tournament._id).populate('teams');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin or Scorer
const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teams');

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin or Scorer
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Unlink tournament from any matches so matches continue to exist safely
    await Match.updateMany({ tournamentId: tournament._id }, { $set: { tournamentId: null } });

    await tournament.deleteOne();
    res.status(200).json({ success: true, message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add team(s) to tournament
// @route   POST /api/tournaments/:id/teams
// @access  Private/Admin or Scorer
const addTeamToTournament = async (req, res) => {
  try {
    const { teamId, teamIds } = req.body;
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

    const toAdd = teamIds ? teamIds : teamId ? [teamId] : [];
    if (toAdd.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify teamId or teamIds to add' });
    }

    const currentTeamIds = (tournament.teams || []).map((t) => t.toString());
    for (const tid of toAdd) {
      if (!currentTeamIds.includes(tid.toString())) {
        tournament.teams.push(tid);
        currentTeamIds.push(tid.toString());
      }
    }

    await tournament.save();
    const populated = await Tournament.findById(tournament._id).populate(
      'teams',
      'name shortName logo primaryColor secondaryColor coach'
    );
    res.status(200).json({ success: true, data: populated, message: 'Team(s) added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove team from tournament
// @route   DELETE /api/tournaments/:id/teams/:teamId
// @access  Private/Admin or Scorer
const removeTeamFromTournament = async (req, res) => {
  try {
    const { id, teamId } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

    tournament.teams = (tournament.teams || []).filter((t) => t.toString() !== teamId.toString());
    await tournament.save();

    const populated = await Tournament.findById(tournament._id).populate(
      'teams',
      'name shortName logo primaryColor secondaryColor coach'
    );
    res.status(200).json({ success: true, data: populated, message: 'Team removed from tournament' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-generate round-robin fixtures for all participating tournament teams
// @route   POST /api/tournaments/:id/generate-fixtures
// @access  Private/Admin or Scorer
const generateFixtures = async (req, res) => {
  try {
    const {
      matchType = '5x5',
      matchStructure = 'HALVES',
      quarterDuration = 900,
      shotClock = 24,
      venue = '',
      startDate,
      startTime = '10:00',
      intervalMinutes = 60,
    } = req.body;

    const tournament = await Tournament.findById(req.params.id).populate('teams');
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

    const teams = tournament.teams || [];
    if (teams.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 teams are required in the tournament to generate fixtures',
      });
    }

    // Generate round robin pairings using Berger / round rotation algorithm
    let teamList = [...teams];
    const isOdd = teamList.length % 2 !== 0;
    if (isOdd) {
      teamList.push(null); // 'BYE' team
    }

    const n = teamList.length;
    const roundsCount = n - 1;
    const matchesPerRound = n / 2;
    const fixtures = [];

    const baseDate = startDate ? new Date(startDate) : new Date(tournament.startDate || Date.now());
    let currentMatchTime = new Date(baseDate);
    const [startH, startM] = (startTime || '10:00').split(':').map((num) => parseInt(num, 10));
    currentMatchTime.setHours(startH || 10, startM || 0, 0, 0);

    let matchIndex = 1;

    for (let round = 0; round < roundsCount; round++) {
      for (let match = 0; match < matchesPerRound; match++) {
        const homeIdx = (round + match) % (n - 1);
        let awayIdx = (n - 1 - match + round) % (n - 1);
        if (match === 0) {
          awayIdx = n - 1;
        }

        const teamA = teamList[homeIdx];
        const teamB = teamList[awayIdx];

        if (teamA && teamB) {
          const scheduledTimeStr = `${currentMatchTime.getHours().toString().padStart(2, '0')}:${currentMatchTime.getMinutes().toString().padStart(2, '0')}`;
          const scheduledDateStr = currentMatchTime.toISOString().split('T')[0];

          fixtures.push({
            matchName: `Round ${round + 1} - M${matchIndex}: ${teamA.shortName || teamA.name} vs ${teamB.shortName || teamB.name}`,
            teamA: teamA._id,
            teamB: teamB._id,
            scheduledDate: scheduledDateStr,
            scheduledTime: scheduledTimeStr,
          });

          matchIndex++;
          currentMatchTime = new Date(currentMatchTime.getTime() + (Number(intervalMinutes) || 60) * 60 * 1000);
        }
      }
    }

    // Now create the matches in database using the existing match creation logic
    const createdMatches = [];
    const reqStarters = matchType === '3x3' ? 3 : 5;

    for (const fix of fixtures) {
      let teamAPlayers = await Player.find({ teamId: fix.teamA });
      if (teamAPlayers.length < reqStarters) {
        const teamDocA = await Team.findById(fix.teamA);
        const tName = teamDocA ? teamDocA.name : 'Team A';
        const needed = reqStarters - teamAPlayers.length;
        for (let i = 1; i <= needed; i++) {
          const np = await Player.create({
            teamId: fix.teamA,
            name: `${tName} Player ${teamAPlayers.length + 1}`,
            jerseyNumber: teamAPlayers.length + 10,
            position: 'Forward',
          });
          teamAPlayers.push(np);
        }
      }

      let teamBPlayers = await Player.find({ teamId: fix.teamB });
      if (teamBPlayers.length < reqStarters) {
        const teamDocB = await Team.findById(fix.teamB);
        const tName = teamDocB ? teamDocB.name : 'Team B';
        const needed = reqStarters - teamBPlayers.length;
        for (let i = 1; i <= needed; i++) {
          const np = await Player.create({
            teamId: fix.teamB,
            name: `${tName} Player ${teamBPlayers.length + 1}`,
            jerseyNumber: teamBPlayers.length + 10,
            position: 'Forward',
          });
          teamBPlayers.push(np);
        }
      }

      const startersA = teamAPlayers.slice(0, reqStarters).map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position || 'Guard',
      }));
      const subsA = teamAPlayers.slice(reqStarters).map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position || 'Guard',
      }));

      const startersB = teamBPlayers.slice(0, reqStarters).map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position || 'Guard',
      }));
      const subsB = teamBPlayers.slice(reqStarters).map((p) => ({
        player: p._id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position || 'Guard',
      }));

      const initialPlayerStats = [
        ...startersA.map((p) => ({
          playerId: p.player, playerName: p.name, jerseyNumber: p.jerseyNumber, teamId: fix.teamA, team: 'A',
          isStarter: true, isActive: true, points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, minutes: 0,
        })),
        ...subsA.map((p) => ({
          playerId: p.player, playerName: p.name, jerseyNumber: p.jerseyNumber, teamId: fix.teamA, team: 'A',
          isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, minutes: 0,
        })),
        ...startersB.map((p) => ({
          playerId: p.player, playerName: p.name, jerseyNumber: p.jerseyNumber, teamId: fix.teamB, team: 'B',
          isStarter: true, isActive: true, points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, minutes: 0,
        })),
        ...subsB.map((p) => ({
          playerId: p.player, playerName: p.name, jerseyNumber: p.jerseyNumber, teamId: fix.teamB, team: 'B',
          isStarter: false, isActive: false, points: 0, onePoints: 0, twoPoints: 0, threePoints: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, fouls: 0, minutes: 0,
        })),
      ];

      const durationSecs = Number(quarterDuration) || (matchType === '3x3' ? 600 : (matchStructure === 'HALVES' ? 900 : 600));
      const shotClockSecs = shotClock !== undefined ? Number(shotClock) : (matchType === '3x3' ? 12 : 24);
      const initialPeriod = matchType === '3x3' ? 'REGULATION' : (matchStructure === 'HALVES' ? 'H1' : 'Q1');

      const newMatch = await Match.create({
        matchType,
        tournamentId: tournament._id,
        matchName: fix.matchName,
        venue: venue || tournament.venue || (matchType === '3x3' ? '3x3 Center Court' : 'Main Arena Court'),
        scheduledDate: fix.scheduledDate,
        scheduledTime: fix.scheduledTime,
        teamA: fix.teamA,
        teamB: fix.teamB,
        teamA_roster: { starters: startersA, substitutes: subsA },
        teamB_roster: { starters: startersB, substitutes: subsB },
        playersA: [...startersA, ...subsA],
        playersB: [...startersB, ...subsB],
        settings: {
          matchStructure,
          gameDuration: durationSecs,
          shotClock: shotClockSecs,
          targetScore: matchType === '3x3' ? 21 : 0,
          numberOfQuarters: matchStructure === 'HALVES' ? 2 : (matchType === '3x3' ? 1 : 4),
          quarterDuration: durationSecs,
          foulLimit: matchType === '3x3' ? 7 : 5,
          timeoutDuration: 60,
        },
        gameDuration: durationSecs,
        remainingTime: durationSecs,
        shotClockDuration: shotClockSecs,
        shotClockRemaining: shotClockSecs,
        currentPeriod: initialPeriod,
        periodScores: [{ period: initialPeriod, scoreA: 0, scoreB: 0 }],
        timeoutsA: matchType === '5x5' ? 5 : 1,
        timeoutsB: matchType === '5x5' ? 5 : 1,
        status: 'SCHEDULED',
        playerStats: initialPlayerStats,
      });

      createdMatches.push(newMatch);
    }

    res.status(201).json({
      success: true,
      count: createdMatches.length,
      data: createdMatches,
      message: `Successfully generated ${createdMatches.length} round-robin fixtures!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournamentById,
  getTournamentStandings,
  createTournament,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
  generateFixtures,
};
