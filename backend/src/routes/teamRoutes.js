const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(getTeams)
  .post(protect, authorize('admin'), createTeam);

router.route('/:id')
  .get(getTeamById)
  .put(protect, authorize('admin'), updateTeam)
  .delete(protect, authorize('admin'), deleteTeam);

module.exports = router;
