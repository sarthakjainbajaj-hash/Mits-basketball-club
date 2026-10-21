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
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('admin', 'scorer'), createTournament);

router.get('/:id/standings', getTournamentStandings);

router.route('/:id')
  .get(getTournamentById)
  .put(protect, authorize('admin', 'scorer'), updateTournament)
  .delete(protect, authorize('admin', 'scorer'), deleteTournament);

router.post('/:id/teams', protect, authorize('admin', 'scorer'), addTeamToTournament);
router.delete('/:id/teams/:teamId', protect, authorize('admin', 'scorer'), removeTeamFromTournament);

module.exports = router;
