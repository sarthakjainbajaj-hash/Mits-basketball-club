const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerLeaderboard,
} = require('../controllers/playerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/stats/leaderboard', getPlayerLeaderboard);

router.route('/')
  .get(getPlayers)
  .post(protect, authorize('admin'), createPlayer);

router.route('/:id')
  .get(getPlayerById)
  .put(protect, authorize('admin'), updatePlayer)
  .delete(protect, authorize('admin'), deletePlayer);

module.exports = router;
