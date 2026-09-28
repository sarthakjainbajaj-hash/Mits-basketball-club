const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');

// @desc    Get all teams (with search/filter)
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { shortName: { $regex: search, $options: 'i' } },
          { coach: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const teams = await Team.find(query).populate('players').sort({ 'stats.wins': -1, name: 1 });
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Get team matches (recent 10)
    const matches = await Match.find({
      $or: [{ teamA: team._id }, { teamB: team._id }],
    })
      .populate('teamA', 'name shortName logo primaryColor')
      .populate('teamB', 'name shortName logo primaryColor')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),
        recentMatches: matches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private/Admin
const createTeam = async (req, res) => {
  try {
    const { name, shortName, logo, primaryColor, secondaryColor, coach } = req.body;

    if (!name || !shortName) {
      return res.status(400).json({
        success: false,
        message: 'Team name and short name are required',
      });
    }

    const existingTeam = await Team.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'A team with this name already exists',
      });
    }

    const team = await Team.create({
      name,
      shortName: shortName.toUpperCase(),
      logo: logo || '',
      primaryColor: primaryColor || '#FF5722',
      secondaryColor: secondaryColor || '#1E293B',
      coach: coach || '',
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Admin
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('players');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Unassign or delete players belonging to this team
    await Player.deleteMany({ teamId: team._id });
    await team.deleteOne();

    res.status(200).json({ success: true, message: 'Team and associated players deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
