import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Printer,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Shield,
  Activity,
  History,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const MatchDetailsPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await matchApi.getById(id);
      setMatch(res?.data || null);
    } catch (err) {
      setToast({ message: 'Failed to load match: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-white font-bold text-lg">Match not found</p>
        <Link to="/history" className="text-orange-400 underline text-sm mt-2 inline-block">
          Return to Match History
        </Link>
      </div>
    );
  }

  const isCompleted = match.status === 'COMPLETED';
  const playerStatsA = (match.playerStats || []).filter((s) => s.team === 'A');
  const playerStatsB = (match.playerStats || []).filter((s) => s.team === 'B');
  const events = match.events || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Print Action */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Match Archives
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Download Match Report (PDF)</span>
        </button>
      </div>

      {/* Official Match Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
            {match.tournamentId?.name || 'Official FIBA 3x3 Match'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-2">
            {match.matchName}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(match.scheduledDate || match.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {match.venue || 'Center Court'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Target: {match.targetScore || 21} PTS
            </span>
          </div>
        </div>

        {/* Big Score Comparison Banner */}
        <div className="grid grid-cols-3 items-center py-6 border-y border-slate-800 max-w-2xl mx-auto">
          {/* Team A */}
          <div className="text-center">
            <h3 className="font-bold text-lg sm:text-2xl text-white truncate">
              {match.teamA?.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Fouls: {match.foulsA || 0}</p>
            <div className="font-digital text-5xl sm:text-7xl font-black text-amber-400 led-amber mt-2">
              {match.scoreA}
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
              FINAL
            </span>
            <div className="w-8 h-0.5 bg-slate-700 mx-auto" />
            {isCompleted && (
              <span className="text-[11px] font-mono text-emerald-400 font-bold mt-2 block">
                WINNER:{' '}
                {match.winner === 'A'
                  ? match.teamA?.shortName
                  : match.winner === 'B'
                  ? match.teamB?.shortName
                  : 'DRAW'}
              </span>
            )}
          </div>

          {/* Team B */}
          <div className="text-center">
            <h3 className="font-bold text-lg sm:text-2xl text-white truncate">
              {match.teamB?.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Fouls: {match.foulsB || 0}</p>
            <div className="font-digital text-5xl sm:text-7xl font-black text-cyan-400 led-cyan mt-2">
              {match.scoreB}
            </div>
          </div>
        </div>
      </div>

      {/* Official Box Score Tables */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" /> Official Player Box Scores
        </h2>

        {/* Team A Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: match.teamA?.primaryColor || '#FF5722' }}
              />
              {match.teamA?.name} Box Score
            </h3>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Team Total: {match.scoreA} PTS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-2 text-center font-bold text-orange-400">PTS</th>
                  <th className="py-2.5 px-2 text-center">1PT</th>
                  <th className="py-2.5 px-2 text-center">2PT</th>
                  <th className="py-2.5 px-2 text-center">REB</th>
                  <th className="py-2.5 px-2 text-center">AST</th>
                  <th className="py-2.5 px-2 text-center">STL</th>
                  <th className="py-2.5 px-2 text-center">BLK</th>
                  <th className="py-2.5 px-2 text-center text-red-400">FOULS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {playerStatsA.map((p) => (
                  <tr key={p.playerId} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-amber-400">#{p.jerseyNumber}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">{p.playerName}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-orange-400 font-digital text-base">
                      {p.points}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.onePoints}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.twoPoints}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.rebounds}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.assists}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.steals}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.blocks}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-red-400">{p.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team B Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: match.teamB?.primaryColor || '#06B6D4' }}
              />
              {match.teamB?.name} Box Score
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Team Total: {match.scoreB} PTS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-2 text-center font-bold text-orange-400">PTS</th>
                  <th className="py-2.5 px-2 text-center">1PT</th>
                  <th className="py-2.5 px-2 text-center">2PT</th>
                  <th className="py-2.5 px-2 text-center">REB</th>
                  <th className="py-2.5 px-2 text-center">AST</th>
                  <th className="py-2.5 px-2 text-center">STL</th>
                  <th className="py-2.5 px-2 text-center">BLK</th>
                  <th className="py-2.5 px-2 text-center text-red-400">FOULS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {playerStatsB.map((p) => (
                  <tr key={p.playerId} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-cyan-400">#{p.jerseyNumber}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">{p.playerName}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-orange-400 font-digital text-base">
                      {p.points}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.onePoints}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.twoPoints}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.rebounds}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.assists}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.steals}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.blocks}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-red-400">{p.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Match Event Chronological Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-white text-base">Match Event Timeline</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{events.length} Events Logged</span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {events.length > 0 ? (
            events.map((ev, i) => (
              <div
                key={ev._id || i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-digital text-xs min-w-[45px]">
                    {ev.gameTime || '00:00'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ev.type === 'SCORE'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : ev.type === 'FOUL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ev.type}
                  </span>
                  <span className="text-white font-sans font-medium">
                    {ev.metadata?.description || `${ev.playerName || 'Team'} - ${ev.type}`}
                  </span>
                </div>

                {ev.points ? (
                  <span className="font-digital font-bold text-amber-400 text-sm">
                    {ev.points > 0 ? `+${ev.points}` : ev.points} PTS
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No timeline events recorded</p>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchDetailsPage;
