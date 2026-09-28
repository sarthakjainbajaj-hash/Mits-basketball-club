import React, { useState, useEffect } from 'react';
import { playerApi } from '../api/playerApi';
import {
  BarChart3,
  Trophy,
  Flame,
  Target,
  Shield,
  Activity,
  Search,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const PlayerStatsPage = () => {
  const [leaderboards, setLeaderboards] = useState({
    topScorers: [],
    topTwoPointers: [],
    topRebounders: [],
    topAssists: [],
  });
  const [allPlayers, setAllPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [lbRes, allRes] = await Promise.all([
        playerApi.getLeaderboard(),
        playerApi.getAll(),
      ]);
      setLeaderboards(lbRes?.data || {});
      setAllPlayers(allRes?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load player stats: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = allPlayers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-orange-500" /> 3x3 Player Statistics & Leaders
        </h1>
        <p className="text-sm text-slate-400">
          Tournament performance rankings, scoring efficiency, and individual leaderboard metrics
        </p>
      </div>

      {/* Leaderboard Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Scorers */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-orange-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-white text-sm">Top Scorers (PTS)</h3>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboards.topScorers && leaderboards.topScorers.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold w-4">{i + 1}.</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="font-digital font-bold text-orange-400 text-sm">
                  {p.stats?.points || 0} PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Point Arc Leaders */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">2PT Arc Leaders</h3>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboards.topTwoPointers && leaderboards.topTwoPointers.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold w-4">{i + 1}.</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="font-digital font-bold text-amber-400 text-sm">
                  {p.stats?.twoPoints || 0} 2PM
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rebounders */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Rebounds Leaders</h3>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboards.topRebounders && leaderboards.topRebounders.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold w-4">{i + 1}.</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="font-digital font-bold text-cyan-400 text-sm">
                  {p.stats?.rebounds || 0} REB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assists */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Assists Leaders</h3>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboards.topAssists && leaderboards.topAssists.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold w-4">{i + 1}.</span>
                  <span className="font-bold text-white truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="font-digital font-bold text-emerald-400 text-sm">
                  {p.stats?.assists || 0} AST
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Player Cumulative Stats Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Complete Player Performance Table
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-3 text-center">G</th>
                <th className="py-3 px-3 text-center font-bold text-orange-400">PTS</th>
                <th className="py-3 px-3 text-center">PPG</th>
                <th className="py-3 px-3 text-center">1PT</th>
                <th className="py-3 px-3 text-center">2PT</th>
                <th className="py-3 px-3 text-center">REB</th>
                <th className="py-3 px-3 text-center">AST</th>
                <th className="py-3 px-3 text-center">STL</th>
                <th className="py-3 px-3 text-center">BLK</th>
                <th className="py-3 px-3 text-center text-red-400">FOUL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPlayers.map((p) => {
                const games = p.stats?.games || 0;
                const points = p.stats?.points || 0;
                const ppg = games > 0 ? (points / games).toFixed(1) : (0).toFixed(1);

                return (
                  <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-400">#{p.jerseyNumber}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-sans whitespace-nowrap text-slate-300">
                      {p.teamId?.name || 'Free Agent'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{p.position}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{games}</td>
                    <td className="py-3 px-3 text-center font-digital font-bold text-orange-400 text-base">
                      {points}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-300 font-bold">{ppg}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.onePoints || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.twoPoints || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.rebounds || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.assists || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.steals || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.blocks || 0}</td>
                    <td className="py-3 px-3 text-center font-bold text-red-400">{p.stats?.fouls || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PlayerStatsPage;
