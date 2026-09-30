import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentApi } from '../api/tournamentApi';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  PlayCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'matches' | 'teams'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        tournamentApi.getById(id),
        tournamentApi.getStandings(id),
      ]);
      setTournament(tRes?.data || null);
      setStandings(sRes?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load tournament: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-white font-bold text-lg">Tournament not found</p>
        <Link to="/tournaments" className="text-orange-400 underline text-sm mt-2 inline-block">
          Return to Tournaments Directory
        </Link>
      </div>
    );
  }

  const matches = tournament.matches || [];
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/tournaments"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Tournament Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {tournament.status}
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(tournament.startDate).toLocaleDateString()} —{' '}
              {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {tournament.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-300 pt-2">
            {tournament.organizer && (
              <div>
                <span className="text-slate-500">ORGANIZER: </span>
                <span className="font-bold text-white">{tournament.organizer}</span>
              </div>
            )}
            {tournament.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-white">{tournament.venue}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">TEAMS: </span>
              <span className="font-bold text-amber-400">{tournament.teams?.length || 0}</span>
            </div>
            <div>
              <span className="text-slate-500">MATCHES: </span>
              <span className="font-bold text-cyan-400">{matches.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'standings'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tournament Standings
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Teams ({tournament.teams?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab: 3x3 Tournament Standings Table */}
      {activeTab === 'standings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">FIBA 3x3 Circuit Standings</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Ranked by: Wins &gt; Point Diff &gt; Points For
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-center">Played</th>
                  <th className="py-3 px-3 text-center text-emerald-400 font-bold">Won</th>
                  <th className="py-3 px-3 text-center text-red-400">Lost</th>
                  <th className="py-3 px-3 text-center text-amber-400 font-bold">PF</th>
                  <th className="py-3 px-3 text-center">PA</th>
                  <th className="py-3 px-3 text-center font-bold">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs sm:text-sm">
                {standings.length > 0 ? (
                  standings.map((st, idx) => (
                    <tr key={st.teamId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        <Link
                          to={`/teams/${st.teamId}`}
                          className="hover:text-orange-400 transition-colors flex items-center gap-2"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: st.primaryColor || '#FF5722' }}
                          />
                          <span>{st.teamName}</span>
                          <span className="text-xs text-slate-500 font-mono">({st.shortName})</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-300">{st.played}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 font-digital font-bold text-base">
                        {st.won}
                      </td>
                      <td className="py-3.5 px-3 text-center text-red-400">{st.lost}</td>
                      <td className="py-3.5 px-3 text-center font-digital font-bold text-amber-400 text-base">
                        {st.pointsFor}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-300">{st.pointsAgainst}</td>
                      <td
                        className={`py-3.5 px-3 text-center font-digital font-bold text-base ${
                          st.difference >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {st.difference > 0 ? `+${st.difference}` : st.difference}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      No match results recorded in this tournament yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Matches List */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.length > 0 ? (
              matches.map((m) => (
                <div
                  key={m._id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase ${
                          m.status === 'LIVE'
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : m.status === 'COMPLETED'
                            ? 'bg-slate-800 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span>
                        {new Date(m.scheduledDate).toLocaleDateString()} @ {m.scheduledTime}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base mb-3">{m.matchName}</h4>

                    <div className="flex items-center justify-between py-2 border-y border-slate-800 my-2">
                      <span className="font-bold text-white text-sm">{m.teamA?.name}</span>
                      <span className="font-digital font-bold text-amber-400 text-lg px-3 py-0.5 rounded bg-slate-950 border border-slate-800 tracking-[0.16em]">
                        {m.scoreA} - {m.scoreB}
                      </span>
                      <span className="font-bold text-white text-sm">{m.teamB?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-2">
                    {m.status === 'COMPLETED' ? (
                      <Link
                        to={`/matches/${m._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5"
                      >
                        <span>Match Report</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        to={`/matches/${m._id}/live`}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Live Scoreboard</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 col-span-2 text-center py-10">
                No matches registered for this tournament
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Participating Teams */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {tournament.teams && tournament.teams.length > 0 ? (
            tournament.teams.map((tm) => (
              <Link
                key={tm._id}
                to={`/teams/${tm._id}`}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition-all text-center flex flex-col items-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-digital font-bold text-white text-xl shadow-md mb-3"
                  style={{ backgroundColor: tm.primaryColor || '#FF5722' }}
                >
                  {tm.shortName || tm.name?.slice(0, 3)}
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                  {tm.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Coach: {tm.coach || 'Head Coach'}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500 col-span-4 text-center py-8">
              No teams assigned to this tournament yet
            </p>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TournamentDetailsPage;
