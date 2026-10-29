const express = require('express');
const router = express.Router();
const {
  getTournaments,
  getTournamentById,
  getTournamentStandings,
  createTournament,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
  generateFixtures,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public read, Admin/SuperAdmin create
router.route('/')
  .get(getTournaments)
  .post(protect, authorize('admin'), createTournament);

router.get('/:id/standings', getTournamentStandings);

// Admin/SuperAdmin edit and delete
router.route('/:id')
  .get(getTournamentById)
  .put(protect, authorize('admin'), updateTournament)
  .delete(protect, authorize('admin'), deleteTournament);

router.post('/:id/teams', protect, authorize('admin'), addTeamToTournament);
router.delete('/:id/teams/:teamId', protect, authorize('admin'), removeTeamFromTournament);
router.post('/:id/generate-fixtures', protect, authorize('admin'), generateFixtures);

module.exports = router;
