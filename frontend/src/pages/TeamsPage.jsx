import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamApi } from '../api/teamApi';
import {
  Shield,
  Plus,
  Search,
  Users,
  Trophy,
  Edit2,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const TeamsPage = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logo: '',
    primaryColor: '#FF5722',
    secondaryColor: '#1E293B',
    coach: '',
  });
  const [playersList, setPlayersList] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await teamApi.getAll({ search });
      setTeams(res?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load teams: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      shortName: '',
      logo: '',
      primaryColor: '#FF5722',
      secondaryColor: '#1E293B',
      coach: '',
    });
    // Default 4 player slots ready to be named immediately
    setPlayersList([
      { name: '', jerseyNumber: 7, position: 'Guard' },
      { name: '', jerseyNumber: 11, position: 'Forward' },
      { name: '', jerseyNumber: 23, position: 'Forward' },
      { name: '', jerseyNumber: 15, position: 'Center' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      shortName: team.shortName,
      logo: team.logo || '',
      primaryColor: team.primaryColor || '#FF5722',
      secondaryColor: team.secondaryColor || '#1E293B',
      coach: team.coach || '',
    });
    setPlayersList(
      (team.players || []).map((p) => ({
        _id: p._id,
        name: p.name || '',
        jerseyNumber: p.jerseyNumber !== undefined ? p.jerseyNumber : 0,
        position: p.position || 'Guard',
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddPlayer = () => {
    const nextJersey =
      playersList.length > 0
        ? (Math.max(...playersList.map((p) => Number(p.jerseyNumber) || 0)) + 1) % 100
        : 1;
    setPlayersList([
      ...playersList,
      { name: '', jerseyNumber: nextJersey, position: 'Guard' },
    ]);
  };

  const handleLoad3x3Template = () => {
    setPlayersList([
      { name: '', jerseyNumber: 7, position: 'Guard' },
      { name: '', jerseyNumber: 11, position: 'Forward' },
      { name: '', jerseyNumber: 23, position: 'Forward' },
      { name: '', jerseyNumber: 15, position: 'Center' },
    ]);
  };

  const handleLoad5x5Template = () => {
    setPlayersList([
      { name: '', jerseyNumber: 0, position: 'Guard' },
      { name: '', jerseyNumber: 1, position: 'Guard' },
      { name: '', jerseyNumber: 3, position: 'Forward' },
      { name: '', jerseyNumber: 7, position: 'Forward' },
      { name: '', jerseyNumber: 15, position: 'Center' },
      { name: '', jerseyNumber: 21, position: 'Guard' },
      { name: '', jerseyNumber: 23, position: 'Forward' },
      { name: '', jerseyNumber: 33, position: 'Center' },
      { name: '', jerseyNumber: 45, position: 'Guard' },
      { name: '', jerseyNumber: 77, position: 'Forward' },
    ]);
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...playersList];
    updated[index] = { ...updated[index], [field]: value };
    setPlayersList(updated);
  };

  const handleRemovePlayer = (index) => {
    setPlayersList(playersList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out completely blank players
      const validPlayers = playersList
        .filter((p) => p.name && p.name.trim().length > 0)
        .map((p) => ({
          ...p,
          name: p.name.trim(),
          jerseyNumber: parseInt(p.jerseyNumber, 10) || 0,
        }));

      const payload = {
        ...formData,
        players: validPlayers,
      };

      if (editingTeam) {
        await teamApi.update(editingTeam._id, payload);
        setToast({
          message: `Team "${formData.name}" and ${validPlayers.length} players saved successfully!`,
          type: 'success',
        });
      } else {
        await teamApi.create(payload);
        setToast({
          message: `Team "${formData.name}" created with ${validPlayers.length} players!`,
          type: 'success',
        });
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove its associated players.`)) {
      return;
    }

    try {
      await teamApi.delete(id);
      setToast({ message: 'Team deleted successfully', type: 'success' });
      fetchTeams();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete team', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-orange-500" /> Basketball Team Directory
          </h1>
          <p className="text-sm text-slate-400">
            Registered franchises, coach rosters, and official tournament records (3x3 & 5x5)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or coach..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-48 sm:w-64"
            />
          </form>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Team
            </button>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div
              key={t._id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between transition-all group relative overflow-hidden"
              style={{ borderTop: `4px solid ${t.primaryColor || '#FF5722'}` }}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {t.logo ? (
                      <img
                        src={t.logo}
                        alt={t.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-digital font-bold text-white text-lg shadow-md"
                        style={{ backgroundColor: t.primaryColor || '#FF5722' }}
                      >
                        {t.shortName}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                          {t.shortName}
                        </span>
                        {t.coach && <span>Coach: {t.coach}</span>}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Team"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Record and Scoring Stats */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">PLAYED</span>
                    <div className="font-digital font-bold text-white text-base">
                      {t.stats?.played || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400">WINS</span>
                    <div className="font-digital font-bold text-emerald-400 text-base">
                      {t.stats?.wins || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-red-400">LOSSES</span>
                    <div className="font-digital font-bold text-red-400 text-base">
                      {t.stats?.losses || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-400">PTS FOR</span>
                    <div className="font-digital font-bold text-amber-400 text-base">
                      {t.stats?.pointsFor || 0}
                    </div>
                  </div>
                </div>

                {/* Roster Player Badges */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Roster: {t.players?.length || 0} players registered</span>
                </div>
              </div>

              <Link
                to={`/teams/${t._id}`}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-orange-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View Team Roster & Matches</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-base">No Teams Found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search or create a new team</p>
        </div>
      )}

      {/* Create / Edit Team Modal with Player Roster */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  {editingTeam ? `Edit Team: ${editingTeam.name}` : 'Create New Team & Players'}
                </h3>
                <p className="text-xs text-slate-400">
                  Define franchise details and enter all team players in one place
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section 1: Team Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono uppercase font-black text-orange-400 tracking-wider">
                    1. Team Franchise Information
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Thunderbolts"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Short Name (3-5 Chars) *
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                      }
                      placeholder="THU"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm uppercase focus:border-orange-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Head Coach
                    </label>
                    <input
                      type="text"
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                      placeholder="e.g. Vikram Mehta"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Logo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://... logo image url"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{formData.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{formData.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Team Players Roster */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-black text-cyan-400 tracking-wider">
                      2. Team Players Roster
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono font-bold">
                      {playersList.length} Players
                    </span>
                  </div>

                  {/* Quick Template Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleLoad3x3Template}
                      className="px-2.5 py-1 rounded-lg bg-orange-950/60 hover:bg-orange-900 border border-orange-700/60 text-orange-300 text-[11px] font-mono font-bold transition-colors"
                      title="Fill 4 player slots for 3x3"
                    >
                      ⚡ 3x3 Roster (4)
                    </button>
                    <button
                      type="button"
                      onClick={handleLoad5x5Template}
                      className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-[11px] font-mono font-bold transition-colors"
                      title="Fill 10 player slots for 5x5"
                    >
                      ⚡ 5x5 Roster (10)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPlayer}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Player
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Enter all player names, jersey numbers, and positions. Players will be automatically created and registered to this team.
                </p>

                {/* Player Rows List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {playersList.length > 0 ? (
                    playersList.map((player, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                          {idx + 1}
                        </span>

                        {/* Jersey Number */}
                        <div className="w-20">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={player.jerseyNumber}
                            onChange={(e) => handlePlayerChange(idx, 'jerseyNumber', e.target.value)}
                            placeholder="#"
                            title="Jersey Number (0-99)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-digital font-bold text-center text-sm outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        {/* Player Name */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                            placeholder={`Player ${idx + 1} full name (e.g. Rahul Sharma)`}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-orange-500"
                          />
                        </div>

                        {/* Position */}
                        <div className="w-28">
                          <select
                            value={player.position}
                            onChange={(e) => handlePlayerChange(idx, 'position', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none focus:border-orange-500 cursor-pointer"
                          >
                            <option value="Guard">Guard</option>
                            <option value="Forward">Forward</option>
                            <option value="Center">Center</option>
                          </select>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Remove player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-2">
                      <Users className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-300">No players added yet</p>
                      <p className="text-xs text-slate-500">
                        Click "+ Add Player" or choose a quick 3x3 / 5x5 template above to enter player names.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 bg-slate-900">
                <div className="text-xs font-mono text-slate-400">
                  {playersList.filter((p) => p.name && p.name.trim()).length} valid player(s) ready to save
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all active:scale-95"
                  >
                    {editingTeam ? 'Save Team & Players' : 'Create Team & Register Players'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeamsPage;
