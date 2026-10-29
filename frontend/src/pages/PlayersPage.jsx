import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playerApi } from '../api/playerApi';
import { teamApi } from '../api/teamApi';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Shield,
  Activity,
  Flame,
  Calculator,
  Sliders,
  Check,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const PlayersPage = () => {
  const { isAdmin, isScorer } = useAuth();
  const canEditStats = isAdmin || isScorer;
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State for Add/Edit Player Info
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: 0,
    position: 'Guard',
    teamId: '',
    profileImage: '',
  });

  // Modal State for Editing Player Scores & Stats
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
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [selectedTeam, selectedPosition]);

  const fetchTeams = async () => {
    try {
      const res = await teamApi.getAll();
      setTeams(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedTeam) params.teamId = selectedTeam;
      if (selectedPosition) params.position = selectedPosition;

      const res = await playerApi.getAll(params);
      setPlayers(res?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load players: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlayers();
  };

  const openCreateModal = () => {
    setEditingPlayer(null);
    setFormData({
      name: '',
      jerseyNumber: Math.floor(Math.random() * 50),
      position: 'Guard',
      teamId: teams.length > 0 ? teams[0]._id : '',
      profileImage: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      teamId: player.teamId?._id || player.teamId,
      profileImage: player.profileImage || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await playerApi.update(editingPlayer._id, formData);
        setToast({ message: 'Player updated successfully', type: 'success' });
      } else {
        await playerApi.create(formData);
        setToast({ message: 'Player created successfully', type: 'success' });
      }
      setIsModalOpen(false);
      fetchPlayers();
    } catch (err) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete player ${name}?`)) return;
    try {
      await playerApi.delete(id);
      setToast({ message: 'Player deleted', type: 'success' });
      fetchPlayers();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete', type: 'error' });
    }
  };

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
        message: `Scores & stats updated for ${selectedPlayerForStats.name}!`,
        type: 'success',
      });
      setIsStatsModalOpen(false);
      setPlayers((prev) =>
        prev.map((p) =>
          p._id === selectedPlayerForStats._id
            ? { ...p, stats: { ...p.stats, ...statsFormData } }
            : p
        )
      );
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
            <span>Player Directory & Stats</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered 3x3 athletes, positional classifications, and career tournament metrics
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Player
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">All Positions</option>
            <option value="Guard">Guard</option>
            <option value="Forward">Forward</option>
            <option value="Center">Center</option>
          </select>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 max-w-full sm:max-w-[180px]"
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

      {/* Players Table / Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : players.length > 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[680px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-3 sm:px-4">#</th>
                  <th className="py-3.5 px-3 sm:px-4">Player</th>
                  <th className="py-3.5 px-3 sm:px-4">Team</th>
                  <th className="py-3.5 px-3">Position</th>
                  <th className="py-3.5 px-2.5 text-center">Games</th>
                  <th className="py-3.5 px-2.5 text-center font-bold text-orange-400">PTS</th>
                  <th className="py-3.5 px-2.5 text-center">1PT</th>
                  <th className="py-3.5 px-2.5 text-center">2PT</th>
                  <th className="py-3.5 px-2.5 text-center font-bold text-amber-400">3PT</th>
                  <th className="py-3.5 px-2.5 text-center">AST</th>
                  <th className="py-3.5 px-2.5 text-center">STL</th>
                  <th className="py-3.5 px-2.5 text-center">BLK</th>
                  <th className="py-3.5 px-2.5 text-center text-red-400">FOULS</th>
                  {(canEditStats || isAdmin) && <th className="py-3.5 px-3 sm:px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs sm:text-sm">
                {players.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-digital font-bold text-amber-400 text-base">
                      #{p.jerseyNumber}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-sans font-bold text-white whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-sans whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold border border-slate-700 bg-slate-950"
                        style={{ color: p.teamId?.primaryColor || '#fff' }}
                      >
                        {p.teamId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.games || 0}</td>
                    <td className="py-3.5 px-2.5 text-center">
                      {canEditStats ? (
                        <button
                          onClick={() => openEditStatsModal(p)}
                          title="Click to edit player score & stats"
                          className="group/pts inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-950/40 hover:bg-orange-500/20 border border-orange-500/40 hover:border-orange-500 transition-all cursor-pointer shadow-sm"
                        >
                          <span className="font-digital font-black text-orange-400 group-hover/pts:text-orange-300 text-base">
                            {p.stats?.points || 0}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-orange-400/70 group-hover/pts:text-orange-300 flex-shrink-0" />
                        </button>
                      ) : (
                        <span className="font-digital font-black text-orange-400 text-base">
                          {p.stats?.points || 0}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.onePoints || 0}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.twoPoints || 0}</td>
                    <td className="py-3.5 px-2.5 text-center font-bold text-amber-300">{p.stats?.threePoints || 0}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.assists || 0}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.steals || 0}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-300">{p.stats?.blocks || 0}</td>
                    <td className="py-3.5 px-2.5 text-center font-bold text-red-400">{p.stats?.fouls || 0}</td>
                    {(canEditStats || isAdmin) && (
                      <td className="py-3.5 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {canEditStats && (
                            <button
                              onClick={() => openEditStatsModal(p)}
                              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs"
                              title="Edit Player Scores & Stats"
                            >
                              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="hidden sm:inline">Edit Score</span>
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                                title="Edit Player Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p._id, p.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors flex-shrink-0"
                                title="Delete Player"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-base">No Players Found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting search filters</p>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">
                {editingPlayer ? 'Edit Player' : 'Register New Player'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Jersey Number (0-99)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={formData.jerseyNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, jerseyNumber: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="Guard">Guard</option>
                    <option value="Forward">Forward</option>
                    <option value="Center">Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                  Assigned Team
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all"
                >
                  {editingPlayer ? 'Save Player' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default PlayersPage;
