const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      uppercase: true,
      trim: true,
      maxlength: 5,
    },
    logo: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#FF5722',
    },
    secondaryColor: {
      type: String,
      default: '#1E293B',
    },
    coach: {
      type: String,
      default: '',
      trim: true,
    },
    captain: {
      type: String,
      default: '',
      trim: true,
    },
    viceCaptain: {
      type: String,
      default: '',
      trim: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    stats: {
      played: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      pointsFor: { type: Number, default: 0 },
      pointsAgainst: { type: Number, default: 0 },
      matches3x3: {
        played: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
      },
      matches5x5: {
        played: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast team sorting
teamSchema.index({ 'stats.wins': -1, name: 1 });

module.exports = mongoose.model('Team', teamSchema);
