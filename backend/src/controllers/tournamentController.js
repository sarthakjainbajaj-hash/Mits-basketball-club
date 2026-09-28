const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams', 'name shortName logo primaryColor')
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tournament by ID with standings
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      'teams',
      'name shortName logo primaryColor secondaryColor'
    );

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Fetch tournament matches
    const matches = await Match.find({ tournamentId: tournament._id })
      .populate('teamA', 'name shortName logo primaryColor')
      .populate('teamB', 'name shortName logo primaryColor')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...tournament.toObject(),
        matches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate 3x3 tournament standings
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

    tournament.teams.forEach((team) => {
      standingsMap[team._id.toString()] = {
        teamId: team._id,
        teamName: team.name,
        shortName: team.shortName,
        logo: team.logo,
        primaryColor: team.primaryColor,
        played: 0,
        won: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        difference: 0,
      };
    });

    // Compute stats from completed matches
    completedMatches.forEach((m) => {
      const teamAId = m.teamA.toString();
      const teamBId = m.teamB.toString();

      if (standingsMap[teamAId]) {
        standingsMap[teamAId].played += 1;
        standingsMap[teamAId].pointsFor += m.scoreA;
        standingsMap[teamAId].pointsAgainst += m.scoreB;
        if (m.scoreA > m.scoreB) {
          standingsMap[teamAId].won += 1;
        } else {
          standingsMap[teamAId].lost += 1;
        }
      }

      if (standingsMap[teamBId]) {
        standingsMap[teamBId].played += 1;
        standingsMap[teamBId].pointsFor += m.scoreB;
        standingsMap[teamBId].pointsAgainst += m.scoreA;
        if (m.scoreB > m.scoreA) {
          standingsMap[teamBId].won += 1;
        } else {
          standingsMap[teamBId].lost += 1;
        }
      }
    });

    // Convert map to array and calculate difference
    const standings = Object.values(standingsMap).map((item) => ({
      ...item,
      difference: item.pointsFor - item.pointsAgainst,
    }));

    // Sort by: Won (descending), then Difference (descending), then PointsFor (descending)
    standings.sort((a, b) => {
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
// @access  Private/Admin
const createTournament = async (req, res) => {
  try {
    const { name, organizer, venue, startDate, endDate, description, teams } = req.body;

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
    });

    const populated = await Tournament.findById(tournament._id).populate('teams');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
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
// @access  Private/Admin
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    await tournament.deleteOne();
    res.status(200).json({ success: true, message: 'Tournament deleted successfully' });
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
};
