const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'SCORE',
        'FOUL',
        'POSSESSION',
        'TIMEOUT',
        'TIMER_START',
        'TIMER_PAUSE',
        'SHOT_CLOCK_RESET',
        'REBOUND',
        'ASSIST',
        'STEAL',
        'BLOCK',
        'MATCH_END',
        'UNDO'
      ],
    },
    team: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    playerName: {
      type: String,
      default: '',
    },
    jerseyNumber: {
      type: Number,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },
    gameTime: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MatchEvent', matchEventSchema);
