const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },
    jerseyNumber: {
      type: Number,
      required: [true, 'Jersey number is required'],
      min: 0,
      max: 99,
    },
    dateOfBirth: {
      type: Date,
    },
    position: {
      type: String,
      enum: ['Guard', 'Forward', 'Center'],
      default: 'Guard',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team association is required'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    stats: {
      games: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
      onePoints: { type: Number, default: 0 },
      twoPoints: { type: Number, default: 0 },
      threePoints: { type: Number, default: 0 }, // For 5x5 basketball
      rebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Player', playerSchema);
