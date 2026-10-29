import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playerApi } from '../api/playerApi';
import {
  BarChart3,
  Trophy,
  Flame,
  Target,
  Shield,
  Activity,
  Search,
  Edit2,
  Calculator,
  Check,
  X,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const PlayerStatsPage = () => {
  const { isAdmin, isScorer } = useAuth();
  const canEditStats = isAdmin || isScorer;
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

  // Edit Player Stats Modal State
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
  const [savingStats, setSavingStats] = useState(false);
  const [statsFormData, setStatsFormData] = useState({
    games: 0,
    points: 0,
    onePoints: 0,
    twoPoints: 0,
    threePoints: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    fouls: 0,
    minutes: 0,
  });

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

  const openEditStatsModal = (player) => {
    setSelectedPlayerForStats(player);
    setStatsFormData({
      games: player.stats?.games ?? 0,
      points: player.stats?.points ?? 0,
      onePoints: player.stats?.onePoints ?? 0,
      twoPoints: player.stats?.twoPoints ?? 0,
      threePoints: player.stats?.threePoints ?? 0,
      rebounds: player.stats?.rebounds ?? 0,
      assists: player.stats?.assists ?? 0,
      steals: player.stats?.steals ?? 0,
      blocks: player.stats?.blocks ?? 0,
      fouls: player.stats?.fouls ?? 0,
      minutes: player.stats?.minutes ?? 0,
    });
    setIsStatsModalOpen(true);
  };

  const handleStatChange = (field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setStatsFormData((prev) => ({ ...prev, [field]: num }));
  };

  const adjustPoints = (delta) => {
    setStatsFormData((prev) => ({
      ...prev,
      points: Math.max(0, (Number(prev.points) || 0) + delta),
    }));
  };

  const autoCalcPoints = () => {
    const pts1 = Number(statsFormData.onePoints) || 0;
    const pts2 = Number(statsFormData.twoPoints) || 0;
    const pts3 = Number(statsFormData.threePoints) || 0;
    const total = pts1 + pts2 * 2 + pts3 * 3;
    setStatsFormData((prev) => ({ ...prev, points: total }));
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayerForStats) return;
    try {
      setSavingStats(true);
      await playerApi.update(selectedPlayerForStats._id, {
        stats: statsFormData,
      });
      setToast({
        message: `Updated scores & stats for ${selectedPlayerForStats.name}!`,
        type: 'success',
      });
      setIsStatsModalOpen(false);
      fetchStats();
    } catch (err) {
      setToast({
        message: err.message || 'Failed to update stats',
        type: 'error',
      });
    } finally {
      setSavingStats(false);
    }
  };

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
                <th className="py-3 px-3 text-center font-bold text-amber-400">3PT</th>
                <th className="py-3 px-3 text-center">AST</th>
                <th className="py-3 px-3 text-center">STL</th>
                <th className="py-3 px-3 text-center">BLK</th>
                <th className="py-3 px-3 text-center text-red-400">FOUL</th>
                {canEditStats && <th className="py-3 px-3 text-right">Actions</th>}
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
                    <td className="py-3 px-3 text-center">
                      {canEditStats ? (
                        <button
                          onClick={() => openEditStatsModal(p)}
                          title="Click to edit player score & stats"
                          className="group/pts inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-950/40 hover:bg-orange-500/20 border border-orange-500/40 hover:border-orange-500 transition-all cursor-pointer"
                        >
                          <span className="font-digital font-bold text-orange-400 group-hover/pts:text-orange-300 text-base">
                            {points}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-orange-400/60 group-hover/pts:text-orange-300 flex-shrink-0" />
                        </button>
                      ) : (
                        <span className="font-digital font-bold text-orange-400 text-base">
                          {points}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-300 font-bold">{ppg}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.onePoints || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.twoPoints || 0}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-300">{p.stats?.threePoints || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.assists || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.steals || 0}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{p.stats?.blocks || 0}</td>
                    <td className="py-3 px-3 text-center font-bold text-red-400">{p.stats?.fouls || 0}</td>
                    {canEditStats && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end whitespace-nowrap">
                          <button
                            onClick={() => openEditStatsModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs"
                            title="Edit Player Scores & Stats"
                          >
                            <Flame className="w-3 h-3 flex-shrink-0" />
                            <span className="hidden sm:inline">Edit Score</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Player Scores & Stats Modal */}
      {isStatsModalOpen && selectedPlayerForStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                    Edit Scores & Stats
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-amber-400 font-bold">#{selectedPlayerForStats.jerseyNumber}</span>
                    <span className="text-white font-semibold">{selectedPlayerForStats.name}</span>
                    <span>•</span>
                    <span className="text-slate-300">{selectedPlayerForStats.teamId?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatsSubmit} className="space-y-4">
              {/* Primary Total Points (PTS) Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-slate-950/60 border border-orange-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-mono uppercase font-black text-orange-400 tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" /> Total Points (PTS)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Primary scoring metric shown on leaderboards & tables
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={autoCalcPoints}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold transition-all self-start sm:self-auto"
                    title="Calculate: 1PT + 2×2PT + 3×3PT"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Auto-Calculate
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      value={statsFormData.points}
                      onChange={(e) => handleStatChange('points', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-orange-500/50 font-digital font-black text-2xl text-orange-400 tracking-wider focus:border-orange-400 focus:ring-1 focus:ring-orange-500 outline-none"
                      required
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-500 uppercase">
                      PTS
                    </span>
                  </div>

                  {/* Quick Delta Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustPoints(-1)}
                      className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 active:scale-95 transition-all"
                      title="Minus 1 point"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPoints(1)}
                      className="px-2.5 py-2.5 rounded-xl bg-orange-600/40 hover:bg-orange-600/60 text-orange-200 font-mono text-xs font-bold border border-orange-500/40 active:scale-95 transition-all"
                      title="Plus 1 point"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPoints(2)}
                      className="px-2.5 py-2.5 rounded-xl bg-orange-600/40 hover:bg-orange-600/60 text-orange-200 font-mono text-xs font-bold border border-orange-500/40 active:scale-95 transition-all"
                      title="Plus 2 points"
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPoints(3)}
                      className="px-2.5 py-2.5 rounded-xl bg-orange-600/40 hover:bg-orange-600/60 text-orange-200 font-mono text-xs font-bold border border-orange-500/40 active:scale-95 transition-all"
                      title="Plus 3 points"
                    >
                      +3
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1PT Shots */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    1-Point Shots (1PT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.onePoints}
                    onChange={(e) => handleStatChange('onePoints', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* 2PT Shots */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    2-Point Shots (2PT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.twoPoints}
                    onChange={(e) => handleStatChange('twoPoints', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* 3PT Shots */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    3-Point Shots (3PT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.threePoints}
                    onChange={(e) => handleStatChange('threePoints', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Games */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    Games Played (GP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.games}
                    onChange={(e) => handleStatChange('games', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Rebounds */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    Rebounds (REB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.rebounds}
                    onChange={(e) => handleStatChange('rebounds', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Assists */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    Assists (AST)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.assists}
                    onChange={(e) => handleStatChange('assists', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Steals */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    Steals (STL)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.steals}
                    onChange={(e) => handleStatChange('steals', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Blocks */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-400">
                    Blocks (BLK)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.blocks}
                    onChange={(e) => handleStatChange('blocks', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Fouls */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-bold text-red-400">
                    Personal Fouls (FOULS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsFormData.fouls}
                    onChange={(e) => handleStatChange('fouls', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-red-300 font-mono text-sm focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(false)}
                  disabled={savingStats}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStats}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all active:scale-95"
                >
                  {savingStats ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Score & Stats</span>
                    </>
                  )}
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

export default PlayerStatsPage;
