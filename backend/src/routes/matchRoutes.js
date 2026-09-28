const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchSummary,
} = require('../controllers/matchController');
const {
  startMatch,
  pauseMatch,
  resetTimer,
  controlShotClock,
  updateScore,
  recordFoul,
  togglePossession,
  callTimeout,
  recordPlayerStat,
  substitutePlayer,
  controlPeriod,
  undoLastAction,
  endMatch,
} = require('../controllers/liveMatchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Standard match CRUD
router.route('/')
  .get(getMatches)
  .post(protect, authorize('admin'), createMatch);

router.get('/:id/summary', getMatchSummary);

router.route('/:id')
  .get(getMatchById)
  .put(protect, authorize('admin', 'scorer'), updateMatch)
  .delete(protect, authorize('admin'), deleteMatch);

// Live Match Scoring & Clock Controls (Scorer and Admin)
router.post('/:id/start', protect, authorize('admin', 'scorer'), startMatch);
router.post('/:id/pause', protect, authorize('admin', 'scorer'), pauseMatch);
router.post('/:id/resume', protect, authorize('admin', 'scorer'), startMatch);
router.post('/:id/reset-timer', protect, authorize('admin', 'scorer'), resetTimer);
router.post('/:id/shot-clock', protect, authorize('admin', 'scorer'), controlShotClock);
router.post('/:id/score', protect, authorize('admin', 'scorer'), updateScore);
router.post('/:id/foul', protect, authorize('admin', 'scorer'), recordFoul);
router.post('/:id/possession', protect, authorize('admin', 'scorer'), togglePossession);
router.post('/:id/timeout', protect, authorize('admin', 'scorer'), callTimeout);
router.post('/:id/player-stats', protect, authorize('admin', 'scorer'), recordPlayerStat);
router.post('/:id/substitute', protect, authorize('admin', 'scorer'), substitutePlayer);
router.post('/:id/period', protect, authorize('admin', 'scorer'), controlPeriod);
router.post('/:id/undo', protect, authorize('admin', 'scorer'), undoLastAction);
router.post('/:id/end', protect, authorize('admin', 'scorer'), endMatch);

module.exports = router;
