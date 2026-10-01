const mongoose = require('mongoose');

const matchPlayerSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    name: { type: String, required: true },
    jerseyNumber: { type: Number, required: true },
    position: { type: String, default: 'Guard' },
  },
  { _id: false }
);

const matchPlayerStatSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    playerName: { type: String, required: true },
    jerseyNumber: { type: Number, required: true },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    team: { type: String, enum: ['A', 'B'], required: true },
    isStarter: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }, // on court vs bench
    points: { type: Number, default: 0 },
    onePoints: { type: Number, default: 0 },
    twoPoints: { type: Number, default: 0 },
    threePoints: { type: Number, default: 0 }, // For 5x5
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
  },
  { _id: false }
);

const periodScoreSchema = new mongoose.Schema(
  {
    period: { type: String, required: true }, // 'Q1', 'Q2', 'Q3', 'Q4', 'OT' or 'REGULATION'
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    matchType: {
      type: String,
      enum: ['3x3', '5x5'],
      default: '3x3',
      required: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      default: null,
    },
    matchName: {
      type: String,
      required: [true, 'Match name is required'],
      trim: true,
    },
    venue: {
      type: String,
      default: 'Main Court',
      trim: true,
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    scheduledTime: {
      type: String,
      default: '18:00',
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team A is required'],
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team B is required'],
    },

    // Detailed Rosters for 3x3 (3 starters, 1 sub) and 5x5 (5 starters, 5 subs)
    teamA_roster: {
      starters: [matchPlayerSchema],
      substitutes: [matchPlayerSchema],
    },
    teamB_roster: {
      starters: [matchPlayerSchema],
      substitutes: [matchPlayerSchema],
    },

    // Backward-compatibility all players
    playersA: [matchPlayerSchema],
    playersB: [matchPlayerSchema],

    scoreA: {
      type: Number,
      default: 0,
      min: 0,
    },
    scoreB: {
      type: Number,
      default: 0,
      min: 0,
    },
    foulsA: {
      type: Number,
      default: 0,
      min: 0,
    },
    foulsB: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeoutsA: {
      type: Number,
      default: 1,
      min: 0,
    },
    timeoutsB: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Match Rules & Format Settings
    settings: {
      gameDuration: { type: Number, default: 600 },
      shotClock: { type: Number, default: 12 },
      targetScore: { type: Number, default: 21 },
      numberOfQuarters: { type: Number, default: 1 },
      quarterDuration: { type: Number, default: 600 },
      foulLimit: { type: Number, default: 7 },
      timeoutDuration: { type: Number, default: 60 }, // 30, 60 (1 min), 120 (2 min)
    },

    // Legacy fields maintained for quick access
    gameDuration: { type: Number, default: 600 },
    remainingTime: { type: Number, default: 600 },
    shotClockDuration: { type: Number, default: 12 },
    shotClockRemaining: { type: Number, default: 12 },
    targetScore: { type: Number, default: 21 },
    foulLimit: { type: Number, default: 7 },
    timeoutDuration: { type: Number, default: 60 },

    // Quarter / Period System
    currentPeriod: {
      type: String,
      default: 'Q1', // 'REGULATION' for 3x3, 'Q1', 'Q2', 'Q3', 'Q4' for 5x5
    },
    periodScores: [periodScoreSchema],

    status: {
      type: String,
      enum: ['SCHEDULED', 'LIVE', 'PAUSED', 'COMPLETED'],
      default: 'SCHEDULED',
    },
    possession: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    timerRunning: {
      type: Boolean,
      default: false,
    },
    timerStartedAt: {
      type: Number,
      default: null,
    },
    shotClockRunning: {
      type: Boolean,
      default: false,
    },
    shotClockStartedAt: {
      type: Number,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    winner: {
      type: String,
      enum: ['A', 'B', 'DRAW', null],
      default: null,
    },
    winnerTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    finalScore: {
      type: String,
      default: '',
    },
    statsPersisted: {
      type: Boolean,
      default: false,
    },
    playerStats: [matchPlayerStatSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual for computed current remaining time based on server timestamps
matchSchema.methods.getCurrentRemainingTime = function () {
  if (!this.timerRunning || !this.timerStartedAt) {
    return this.remainingTime;
  }
  const elapsedSeconds = (Date.now() - this.timerStartedAt) / 1000;
  return Math.max(0, Math.round((this.remainingTime - elapsedSeconds) * 10) / 10);
};

// Virtual for computed current shot clock time
matchSchema.methods.getCurrentShotClockRemaining = function () {
  if (!this.shotClockRunning || !this.shotClockStartedAt) {
    return this.shotClockRemaining;
  }
  const elapsedSeconds = (Date.now() - this.shotClockStartedAt) / 1000;
  return Math.max(0, Math.round((this.shotClockRemaining - elapsedSeconds) * 10) / 10);
};

// Indexes for fast lookups
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ tournamentId: 1, createdAt: -1 });
matchSchema.index({ matchType: 1, status: 1 });
matchSchema.index({ teamA: 1, teamB: 1 });

module.exports = mongoose.model('Match', matchSchema);
