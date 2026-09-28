import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const MatchHistoryPage = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [selectedStatus, selectedTeam, selectedTournament]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <History className="w-8 h-8 text-orange-500" /> Match Archives & Results
        </h1>
        <p className="text-sm text-slate-400">
          Official game records, chronological box scores, and tournament archives
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by match or team..."
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

            return (
              <div
                key={m._id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
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
                    <span>
                      {new Date(m.scheduledDate || m.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-orange-400 transition-colors">
                    {m.matchName}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono mb-4">
                    {m.tournamentId?.name || 'Exhibition 3x3'} • {m.venue || 'Center Court'}
                  </p>

                  {/* Scoreboard display */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-2">
                    <div className="flex-1">
                      <span className="font-bold text-white text-sm block truncate">
                        {m.teamA?.shortName || m.teamA?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Fouls: {m.foulsA || 0}
                      </span>
                    </div>

                    <div className="px-3.5 py-1 rounded-xl bg-slate-900 font-digital font-black text-xl text-amber-400 border border-slate-700 mx-2">
                      {m.scoreA} - {m.scoreB}
                    </div>

                    <div className="flex-1 text-right">
                      <span className="font-bold text-white text-sm block truncate">
                        {m.teamB?.shortName || m.teamB?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Fouls: {m.foulsB || 0}
                      </span>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="text-center mt-2 text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Winner:{' '}
                        {m.winner === 'A'
                          ? m.teamA?.name
                          : m.winner === 'B'
                          ? m.teamB?.name
                          : 'Draw'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <Link
                    to={`/matches/${m._id}`}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>{isCompleted ? 'View Official Box Score' : 'Match Preview'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchHistoryPage;
