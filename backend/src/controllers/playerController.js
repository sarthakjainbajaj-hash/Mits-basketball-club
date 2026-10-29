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

// @desc    Update player (metadata & stats/scores)
// @route   PUT /api/players/:id
// @access  Private/Admin or Scorer
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
      player.teamId = req.body.teamId;
    }

    // Update basic fields if provided
    if (req.body.name !== undefined) player.name = req.body.name.trim();
    if (req.body.jerseyNumber !== undefined) player.jerseyNumber = Number(req.body.jerseyNumber);
    if (req.body.position !== undefined) player.position = req.body.position;
    if (req.body.profileImage !== undefined) player.profileImage = req.body.profileImage;
    if (req.body.isCaptain !== undefined) player.isCaptain = Boolean(req.body.isCaptain);
    if (req.body.isViceCaptain !== undefined) player.isViceCaptain = Boolean(req.body.isViceCaptain);

    // If stats / scores are provided, safely update them
    if (req.body.stats && typeof req.body.stats === 'object') {
      if (!player.stats) player.stats = {};
      const s = req.body.stats;
      if (s.games !== undefined) player.stats.games = Math.max(0, Number(s.games) || 0);
      if (s.points !== undefined) player.stats.points = Math.max(0, Number(s.points) || 0);
      if (s.onePoints !== undefined) player.stats.onePoints = Math.max(0, Number(s.onePoints) || 0);
      if (s.twoPoints !== undefined) player.stats.twoPoints = Math.max(0, Number(s.twoPoints) || 0);
      if (s.threePoints !== undefined) player.stats.threePoints = Math.max(0, Number(s.threePoints) || 0);
      if (s.rebounds !== undefined) player.stats.rebounds = Math.max(0, Number(s.rebounds) || 0);
      if (s.assists !== undefined) player.stats.assists = Math.max(0, Number(s.assists) || 0);
      if (s.steals !== undefined) player.stats.steals = Math.max(0, Number(s.steals) || 0);
      if (s.blocks !== undefined) player.stats.blocks = Math.max(0, Number(s.blocks) || 0);
      if (s.fouls !== undefined) player.stats.fouls = Math.max(0, Number(s.fouls) || 0);
      if (s.minutes !== undefined) player.stats.minutes = Math.max(0, Number(s.minutes) || 0);
    }

    await player.save();

    const updatedPlayer = await Player.findById(player._id).populate('teamId');
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
