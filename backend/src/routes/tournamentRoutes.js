const express = require('express');
const router = express.Router();
const {
  getTournaments,
  getTournamentById,
  getTournamentStandings,
  createTournament,
  updateTournament,
  deleteTournament,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('admin'), createTournament);

router.get('/:id/standings', getTournamentStandings);

router.route('/:id')
  .get(getTournamentById)
  .put(protect, authorize('admin'), updateTournament)
  .delete(protect, authorize('admin'), deleteTournament);

module.exports = router;
