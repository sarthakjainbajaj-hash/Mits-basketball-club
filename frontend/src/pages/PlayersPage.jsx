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
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const PlayersPage = () => {
  const { isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: 0,
    position: 'Guard',
    teamId: '',
    profileImage: '',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-orange-500" /> Player Directory & Stats
          </h1>
          <p className="text-sm text-slate-400">
            Registered 3x3 athletes, positional classifications, and career tournament metrics
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Player
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 max-w-[180px]"
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-3">Position</th>
                  <th className="py-3.5 px-3 text-center">Games</th>
                  <th className="py-3.5 px-3 text-center font-bold text-orange-400">PTS</th>
                  <th className="py-3.5 px-3 text-center">1PT</th>
                  <th className="py-3.5 px-3 text-center">2PT</th>
                  <th className="py-3.5 px-3 text-center">REB</th>
                  <th className="py-3.5 px-3 text-center">AST</th>
                  <th className="py-3.5 px-3 text-center">STL</th>
                  <th className="py-3.5 px-3 text-center">BLK</th>
                  <th className="py-3.5 px-3 text-center text-red-400">FOULS</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs sm:text-sm">
                {players.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-digital font-bold text-amber-400 text-base">
                      #{p.jerseyNumber}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 font-sans whitespace-nowrap">
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
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.games || 0}</td>
                    <td className="py-3.5 px-3 text-center font-digital font-black text-orange-400 text-base">
                      {p.stats?.points || 0}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.onePoints || 0}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.twoPoints || 0}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.rebounds || 0}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.assists || 0}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.steals || 0}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{p.stats?.blocks || 0}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-red-400">{p.stats?.fouls || 0}</td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Player"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Delete Player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PlayersPage;
