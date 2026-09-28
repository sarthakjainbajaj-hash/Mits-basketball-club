const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },
    organizer: {
      type: String,
      default: '',
      trim: true,
    },
    venue: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED'],
      default: 'UPCOMING',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
