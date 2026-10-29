import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import { tournamentApi } from '../api/tournamentApi';
import {
  History,
  Search,
  Filter,
  Calendar,
  Trophy,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Flame,
  Trash2,
  Clock,
  Edit3,
  X,
  MapPin,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const MatchHistoryPage = () => {
  const { isAdmin, isScorer } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(''); // '3x3', '5x5', or ''
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    matchId: '',
    matchName: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [selectedFormat, selectedStatus, selectedTeam, selectedTournament]);

  const fetchFilters = async () => {
    try {
      const [tmRes, tRes] = await Promise.all([teamApi.getAll(), tournamentApi.getAll()]);
      setTeams(tmRes?.data || []);
      setTournaments(tRes?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedFormat) params.matchType = selectedFormat;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedTeam) params.teamId = selectedTeam;
      if (selectedTournament) params.tournamentId = selectedTournament;

      const res = await matchApi.getAll(params);
      setMatches(res?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load matches: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMatches();
  };

  const handleDeleteMatch = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete match "${name}"?`)) {
      return;
    }
    try {
      await matchApi.delete(id);
      setToast({ message: 'Match deleted successfully', type: 'success' });
      fetchMatches();
    } catch (err) {
      setToast({ message: 'Failed to delete match: ' + err.message, type: 'error' });
    }
  };

  const handleOpenReschedule = (m) => {
    const rawDate = m.scheduledDate ? new Date(m.scheduledDate) : new Date();
    const yyyy = rawDate.getFullYear();
    const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
    const dd = String(rawDate.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setRescheduleForm({
      matchId: m._id,
      matchName: m.matchName || '',
      scheduledDate: formattedDate,
      scheduledTime: m.scheduledTime || '18:00',
      venue: m.venue || '',
    });
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.matchId) return;
    try {
      setRescheduling(true);
      await matchApi.update(rescheduleForm.matchId, {
        matchName: rescheduleForm.matchName,
        scheduledDate: rescheduleForm.scheduledDate,
        scheduledTime: rescheduleForm.scheduledTime,
        venue: rescheduleForm.venue,
      });
      setToast({ message: 'Match schedule updated successfully!', type: 'success' });
      setIsRescheduleModalOpen(false);
      fetchMatches();
    } catch (err) {
      setToast({ message: 'Failed to update schedule: ' + err.message, type: 'error' });
    } finally {
      setRescheduling(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <History className="w-8 h-8 text-orange-500" /> Match Archives & Results
        </h1>
        <p className="text-sm text-slate-400">
          Official game records, chronological box scores, and tournament archives for 3x3 and 5x5 formats
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        {/* Quick Format Filter Tabs */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
            Format:
          </span>
          <button
            onClick={() => setSelectedFormat('')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedFormat === ''
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setSelectedFormat('3x3')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              selectedFormat === '3x3'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <span>🏀 3x3 Basketball</span>
          </button>
          <button
            onClick={() => setSelectedFormat('5x5')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              selectedFormat === '5x5'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <span>🏀 5x5 Basketball</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by match title or team name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="LIVE">Live Now</option>
              <option value="SCHEDULED">Upcoming Scheduled</option>
            </select>

            {/* Tournament Filter */}
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 max-w-[170px]"
            >
              <option value="">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Team Filter */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 max-w-[150px]"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m) => {
            const isCompleted = m.status === 'COMPLETED';
            const isLive = m.status === 'LIVE' || m.status === 'PAUSED';
            const is5x5 = m.matchType === '5x5';

            return (
              <div
                key={m._id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {/* Format Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                          is5x5
                            ? 'bg-blue-950/90 text-blue-400 border-blue-800'
                            : 'bg-orange-950/90 text-orange-400 border-orange-800'
                        }`}
                      >
                        {is5x5 ? '5x5' : '3x3'}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase ${
                          isLive
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : isCompleted
                            ? 'bg-slate-800 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(m.scheduledDate || m.createdAt).toLocaleDateString()} {m.scheduledTime ? `@ ${m.scheduledTime}` : ''}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-orange-400 transition-colors">
                    {m.matchName}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono mb-3">
                    {m.tournamentId?.name || (is5x5 ? '5x5 Classic' : '3x3 Circuit')} • {m.venue || 'Center Court'}
                  </p>

                  {/* Scoreboard display */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-bold text-white text-sm block truncate">
                        {m.teamA?.name || m.teamA?.shortName}
                      </span>
                      {m.teamA?.shortName && m.teamA?.name && m.teamA.shortName !== m.teamA.name && (
                        <span className="text-[11px] text-slate-400 font-mono block truncate">
                          ({m.teamA.shortName})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Fouls: {m.foulsA || 0}
                      </span>
                    </div>

                    <div className="px-3.5 py-1 rounded-xl bg-slate-900 font-digital font-black text-xl text-amber-400 border border-slate-700 mx-2 tracking-[0.16em] flex-shrink-0">
                      {m.scoreA} - {m.scoreB}
                    </div>

                    <div className="flex-1 min-w-0 text-right pl-2">
                      <span className="font-bold text-white text-sm block truncate">
                        {m.teamB?.name || m.teamB?.shortName}
                      </span>
                      {m.teamB?.shortName && m.teamB?.name && m.teamB.shortName !== m.teamB.name && (
                        <span className="text-[11px] text-slate-400 font-mono block truncate">
                          ({m.teamB.shortName})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Fouls: {m.foulsB || 0}
                      </span>
                    </div>
                  </div>

                  {/* 5x5 Quarters or Winner Tag */}
                  {is5x5 && m.periodScores && m.periodScores.length > 0 && (
                    <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                      {m.periodScores.map((ps) => (
                        <span key={ps.period}>
                          {ps.period}: {ps.scoreA}-{ps.scoreB}
                        </span>
                      ))}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">
                          {Number(m.scoreA ?? 0) > Number(m.scoreB ?? 0)
                            ? `${m.teamA?.name || 'Team A'} wins by ${Number(m.scoreA) - Number(m.scoreB)} ${Number(m.scoreA) - Number(m.scoreB) === 1 ? 'point' : 'points'}`
                            : Number(m.scoreB ?? 0) > Number(m.scoreA ?? 0)
                            ? `${m.teamB?.name || 'Team B'} wins by ${Number(m.scoreB) - Number(m.scoreA)} ${Number(m.scoreB) - Number(m.scoreA) === 1 ? 'point' : 'points'}`
                            : `Match Tied (${m.scoreA ?? 0} - ${m.scoreB ?? 0})`}
                        </span>
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex-shrink-0 ml-2">
                        Final
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  {m.status === 'SCHEDULED' && (isAdmin || isScorer) && (
                    <button
                      type="button"
                      onClick={() => handleOpenReschedule(m)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                      title="Edit Date, Timing & Court"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  <Link
                    to={`/matches/${m._id}`}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>{isCompleted ? 'View Official Box Score' : 'Match Staging / Preview'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  {(isAdmin || isScorer) && (
                    <button
                      onClick={() => handleDeleteMatch(m._id, m.matchName)}
                      title="Delete Match"
                      className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-400 hover:text-red-200 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-base">No Matches Found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing or adjusting your search filters</p>
        </div>
      )}

      {/* Reschedule Match Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Reschedule Match</h3>
                <p className="text-xs text-slate-400 font-mono">Update scheduled date, kick-off time, and venue</p>
              </div>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Match Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={rescheduleForm.matchName}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, matchName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.scheduledDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleForm.scheduledTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduledTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Court / Venue
                </label>
                <input
                  type="text"
                  value={rescheduleForm.venue}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, venue: e.target.value })}
                  placeholder="e.g. Main Court, Court 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
                >
                  {rescheduling ? 'Saving Schedule...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchHistoryPage;
