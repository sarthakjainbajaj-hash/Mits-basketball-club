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
    points: { type: Number, default: 0 },
    onePoints: { type: Number, default: 0 },
    twoPoints: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
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
      default: 'Main Court 3x3',
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
      default: 1, // FIBA 3x3 standard 1 timeout per team
      min: 0,
    },
    timeoutsB: {
      type: Number,
      default: 1,
      min: 0,
    },
    gameDuration: {
      type: Number,
      default: 600, // 10 minutes in seconds
    },
    remainingTime: {
      type: Number,
      default: 600,
    },
    shotClockDuration: {
      type: Number,
      default: 12, // 12 seconds 3x3 shot clock
    },
    shotClockRemaining: {
      type: Number,
      default: 12,
    },
    targetScore: {
      type: Number,
      default: 21, // 3x3 sudden victory target score
    },
    foulLimit: {
      type: Number,
      default: 7, // 7 fouls = penalty
    },
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
      type: Number, // ms epoch
      default: null,
    },
    shotClockRunning: {
      type: Boolean,
      default: false,
    },
    shotClockStartedAt: {
      type: Number, // ms epoch
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
      type: Number, // total elapsed seconds
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

module.exports = mongoose.model('Match', matchSchema);
