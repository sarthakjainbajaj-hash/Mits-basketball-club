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

// @desc    Create new team (with optional initial players)
// @route   POST /api/teams
// @access  Private/Admin
const createTeam = async (req, res) => {
  try {
    const { name, shortName, logo, primaryColor, secondaryColor, coach, players } = req.body;

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
      name: name.trim(),
      shortName: shortName.toUpperCase().trim(),
      logo: logo || '',
      primaryColor: primaryColor || '#FF5722',
      secondaryColor: secondaryColor || '#1E293B',
      coach: coach || '',
    });

    // If players list provided, create players linked to this team
    if (Array.isArray(players) && players.length > 0) {
      const createdPlayerIds = [];
      const usedJerseys = new Set();

      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p || !p.name || !p.name.trim()) continue;

        let jNum = parseInt(p.jerseyNumber, 10);
        if (isNaN(jNum) || jNum < 0 || jNum > 99 || usedJerseys.has(jNum)) {
          jNum = 0;
          while (usedJerseys.has(jNum) && jNum <= 99) jNum++;
        }
        usedJerseys.add(jNum);

        const newPlayer = await Player.create({
          name: p.name.trim(),
          jerseyNumber: jNum,
          position: ['Guard', 'Forward', 'Center'].includes(p.position) ? p.position : 'Guard',
          teamId: team._id,
          profileImage: p.profileImage || '',
        });
        createdPlayerIds.push(newPlayer._id);
      }

      team.players = createdPlayerIds;
      await team.save();
    }

    const populatedTeam = await Team.findById(team._id).populate('players');
    res.status(201).json({ success: true, data: populatedTeam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Admin
const updateTeam = async (req, res) => {
  try {
    const { name, shortName, logo, primaryColor, secondaryColor, coach, players } = req.body;

    let team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (name && name.trim().toLowerCase() !== team.name.toLowerCase()) {
      const existingTeam = await Team.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: team._id },
      });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'A team with this name already exists',
        });
      }
      team.name = name.trim();
    }

    if (shortName) team.shortName = shortName.toUpperCase().trim();
    if (logo !== undefined) team.logo = logo;
    if (primaryColor) team.primaryColor = primaryColor;
    if (secondaryColor) team.secondaryColor = secondaryColor;
    if (coach !== undefined) team.coach = coach;

    // Synchronize players if array was provided
    if (Array.isArray(players)) {
      const activePlayerIds = [];
      const usedJerseys = new Set();

      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p || !p.name || !p.name.trim()) continue;

        let jNum = parseInt(p.jerseyNumber, 10);
        if (isNaN(jNum) || jNum < 0 || jNum > 99 || usedJerseys.has(jNum)) {
          jNum = 0;
          while (usedJerseys.has(jNum) && jNum <= 99) jNum++;
        }
        usedJerseys.add(jNum);

        if (p._id) {
          // Update existing player
          const updatedP = await Player.findByIdAndUpdate(
            p._id,
            {
              name: p.name.trim(),
              jerseyNumber: jNum,
              position: ['Guard', 'Forward', 'Center'].includes(p.position) ? p.position : 'Guard',
              teamId: team._id,
            },
            { new: true }
          );
          if (updatedP) activePlayerIds.push(updatedP._id);
        } else {
          // Create new player
          const newPlayer = await Player.create({
            name: p.name.trim(),
            jerseyNumber: jNum,
            position: ['Guard', 'Forward', 'Center'].includes(p.position) ? p.position : 'Guard',
            teamId: team._id,
            profileImage: p.profileImage || '',
          });
          activePlayerIds.push(newPlayer._id);
        }
      }

      // Clean up players that were removed
      const currentIdStrings = activePlayerIds.map((id) => id.toString());
      const existingPlayers = await Player.find({ teamId: team._id });
      for (const ep of existingPlayers) {
        if (!currentIdStrings.includes(ep._id.toString())) {
          await ep.deleteOne();
        }
      }

      team.players = activePlayerIds;
    }

    await team.save();

    const populatedTeam = await Team.findById(team._id).populate('players');
    res.status(200).json({ success: true, data: populatedTeam });
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
