const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchSummary,
  assignMatchScorer,
  getMatchAuditLogs,
  restoreMatchScore,
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
  setTime,
  addOrReplacePlayer,
  syncMatchRosters,
} = require('../controllers/liveMatchController');
const { protect } = require('../middleware/auth');
const { authorize, verifyMatchScorer } = require('../middleware/role');

// Standard match CRUD (Admin and Super Admin only for mutations)
router.route('/')
  .get(getMatches)
  .post(protect, authorize('admin'), createMatch);

router.get('/:id/summary', getMatchSummary);

// Scorer Assignment & Audit Logs (Admin and Super Admin only)
router.put('/:id/assign-scorer', protect, authorize('admin'), assignMatchScorer);
router.get('/:id/audit-logs', protect, authorize('admin'), getMatchAuditLogs);
router.post('/:id/restore-score', protect, authorize('admin'), restoreMatchScore);

router.route('/:id')
  .get(getMatchById)
  .put(protect, authorize('admin', 'scorer'), updateMatch)
  .delete(protect, authorize('admin'), deleteMatch);

// Live Match Scoring & Clock Controls
// Strictly protected by verifyMatchScorer:
// - Super Admin and Admin can control any match
// - Scorers can ONLY score and control the specific match they are assigned to
// - Viewers and unassigned scorers are rejected with HTTP 403
router.post('/:id/start', protect, verifyMatchScorer, startMatch);
router.post('/:id/pause', protect, verifyMatchScorer, pauseMatch);
router.post('/:id/resume', protect, verifyMatchScorer, startMatch);
router.post('/:id/reset-timer', protect, verifyMatchScorer, resetTimer);
router.post('/:id/set-time', protect, verifyMatchScorer, setTime);
router.post('/:id/shot-clock', protect, verifyMatchScorer, controlShotClock);
router.post('/:id/score', protect, verifyMatchScorer, updateScore);
router.post('/:id/foul', protect, verifyMatchScorer, recordFoul);
router.post('/:id/possession', protect, verifyMatchScorer, togglePossession);
router.post('/:id/timeout', protect, verifyMatchScorer, callTimeout);
router.post('/:id/player-stats', protect, verifyMatchScorer, recordPlayerStat);
router.post('/:id/substitute', protect, verifyMatchScorer, substitutePlayer);
router.post('/:id/period', protect, verifyMatchScorer, controlPeriod);
router.post('/:id/players/add-replace', protect, verifyMatchScorer, addOrReplacePlayer);
router.post('/:id/sync-rosters', protect, verifyMatchScorer, syncMatchRosters);
router.post('/:id/undo', protect, verifyMatchScorer, undoLastAction);
router.post('/:id/end', protect, verifyMatchScorer, endMatch);

module.exports = router;
