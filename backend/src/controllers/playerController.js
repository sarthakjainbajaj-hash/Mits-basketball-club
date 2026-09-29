const Player = require('../models/Player');
const Team = require('../models/Team');

// @desc    Get all players with filtering
// @route   GET /api/players
// @access  Public
const getPlayers = async (req, res) => {
  try {
    const { teamId, position, search } = req.query;
    let query = {};

    if (teamId) {
      query.teamId = teamId;
    }

    if (position) {
      query.position = position;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const players = await Player.find(query)
      .populate('teamId', 'name shortName logo primaryColor')
      .sort({ 'stats.points': -1, name: 1 })
      .lean();

    res.status(200).json({ success: true, count: players.length, data: players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single player by ID
// @route   GET /api/players/:id
// @access  Public
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('teamId');
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.status(200).json({ success: true, data: player });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create player
// @route   POST /api/players
// @access  Private/Admin
const createPlayer = async (req, res) => {
  try {
    const { name, jerseyNumber, dateOfBirth, position, teamId, profileImage } = req.body;

    if (!name || jerseyNumber === undefined || !teamId) {
      return res.status(400).json({
        success: false,
        message: 'Name, jersey number, and team are required',
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Specified team does not exist' });
    }

    // Check if jersey number already taken on this team
    const jerseyTaken = await Player.findOne({ teamId, jerseyNumber });
    if (jerseyTaken) {
      return res.status(400).json({
        success: false,
        message: `Jersey #${jerseyNumber} is already taken on team ${team.name}`,
      });
    }

    const player = await Player.create({
      name,
      jerseyNumber,
      dateOfBirth,
      position: position || 'Guard',
      teamId,
      profileImage: profileImage || '',
    });

    // Add player to team's players array
    await Team.findByIdAndUpdate(teamId, { $addToSet: { players: player._id } });

    const populatedPlayer = await Player.findById(player._id).populate('teamId');
    res.status(201).json({ success: true, data: populatedPlayer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private/Admin
const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // If changing team, update old and new team arrays
    if (req.body.teamId && req.body.teamId !== player.teamId.toString()) {
      await Team.findByIdAndUpdate(player.teamId, { $pull: { players: player._id } });
      await Team.findByIdAndUpdate(req.body.teamId, { $addToSet: { players: player._id } });
    }

    const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teamId');

    res.status(200).json({ success: true, data: updatedPlayer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private/Admin
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Remove from team's roster
    await Team.findByIdAndUpdate(player.teamId, { $pull: { players: player._id } });
    await player.deleteOne();

    res.status(200).json({ success: true, message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get player statistics leaderboard
// @route   GET /api/players/stats/leaderboard
// @access  Public
const getPlayerLeaderboard = async (req, res) => {
  try {
    const topScorers = await Player.find()
      .populate('teamId', 'name shortName logo primaryColor')
      .sort({ 'stats.points': -1 })
      .limit(10)
      .lean();

    const topTwoPointers = await Player.find()
      .populate('teamId', 'name shortName logo primaryColor')
      .sort({ 'stats.twoPoints': -1 })
      .limit(10)
      .lean();

    const topRebounders = await Player.find()
      .populate('teamId', 'name shortName logo primaryColor')
      .sort({ 'stats.rebounds': -1 })
      .limit(10)
      .lean();

    const topAssists = await Player.find()
      .populate('teamId', 'name shortName logo primaryColor')
      .sort({ 'stats.assists': -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        topScorers,
        topTwoPointers,
        topRebounders,
        topAssists,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerLeaderboard,
};
