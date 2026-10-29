const mongoose = require('mongoose');

const scoreAuditLogSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      default: null,
      index: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    operatorName: {
      type: String,
      required: true,
      trim: true,
    },
    operatorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    operatorRole: {
      type: String,
      enum: ['superadmin', 'admin', 'scorer'],
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        'SCORE_UPDATE',
        'SCORE_MANUAL_EDIT',
        'SCORE_RESTORATION',
        'SCORE_UNDO',
        'FOUL_UPDATE',
        'TIMER_CONTROL',
        'PERIOD_CHANGE',
        'MATCH_START',
        'MATCH_END',
        'SCORER_ASSIGNMENT',
      ],
      required: true,
    },
    previousScoreA: {
      type: Number,
      required: true,
      default: 0,
    },
    previousScoreB: {
      type: Number,
      required: true,
      default: 0,
    },
    newScoreA: {
      type: Number,
      required: true,
      default: 0,
    },
    newScoreB: {
      type: Number,
      required: true,
      default: 0,
    },
    pointsDelta: {
      type: Number,
      default: 0,
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
    gameTime: {
      type: String,
      default: '',
    },
    period: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRestored: {
      type: Boolean,
      default: false,
    },
    restoredAt: {
      type: Date,
      default: null,
    },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

scoreAuditLogSchema.index({ matchId: 1, createdAt: -1 });
scoreAuditLogSchema.index({ tournamentId: 1, createdAt: -1 });
scoreAuditLogSchema.index({ operatorId: 1, createdAt: -1 });

module.exports = mongoose.model('ScoreAuditLog', scoreAuditLogSchema);
