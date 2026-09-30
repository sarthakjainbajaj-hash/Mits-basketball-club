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
    captain: '',
    captainJersey: 7,
    captainPosition: 'Guard',
    captainPlayerId: null,
    viceCaptain: '',
    viceCaptainJersey: 11,
    viceCaptainPosition: 'Forward',
    viceCaptainPlayerId: null,
  });
  const [additionalPlayers, setAdditionalPlayers] = useState([]);

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
      captain: '',
      captainJersey: 7,
      captainPosition: 'Guard',
      captainPlayerId: null,
      viceCaptain: '',
      viceCaptainJersey: 11,
      viceCaptainPosition: 'Forward',
      viceCaptainPlayerId: null,
    });
    // Default 2 additional members ready so with Captain + VC they make 4 players for 3x3!
    setAdditionalPlayers([
      { name: '', jerseyNumber: 23, position: 'Forward' },
      { name: '', jerseyNumber: 15, position: 'Center' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    const capPlayer = (team.players || []).find((p) => p.isCaptain || p.name?.includes('(C)'));
    const vcPlayer = (team.players || []).find((p) => p.isViceCaptain || p.name?.includes('(VC)'));

    const rawCap =
      team.captain ||
      (capPlayer ? capPlayer.name.replace(/\s*\(C\)/gi, '').trim() : team.coach || '');
    const rawVC =
      team.viceCaptain ||
      (vcPlayer ? vcPlayer.name.replace(/\s*\(VC\)/gi, '').trim() : '');

    setFormData({
      name: team.name,
      shortName: team.shortName,
      logo: team.logo || '',
      primaryColor: team.primaryColor || '#FF5722',
      secondaryColor: team.secondaryColor || '#1E293B',
      captain: rawCap,
      captainJersey: capPlayer ? capPlayer.jerseyNumber : 7,
      captainPosition: capPlayer ? capPlayer.position : 'Guard',
      captainPlayerId: capPlayer?._id || null,
      viceCaptain: rawVC,
      viceCaptainJersey: vcPlayer ? vcPlayer.jerseyNumber : 11,
      viceCaptainPosition: vcPlayer ? vcPlayer.position : 'Forward',
      viceCaptainPlayerId: vcPlayer?._id || null,
    });

    const otherPlayers = (team.players || []).filter(
      (p) => p._id !== capPlayer?._id && p._id !== vcPlayer?._id
    );

    setAdditionalPlayers(
      otherPlayers.map((p) => ({
        _id: p._id,
        name: p.name || '',
        jerseyNumber: p.jerseyNumber !== undefined ? p.jerseyNumber : 0,
        position: p.position || 'Guard',
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddAdditionalPlayer = () => {
    const existing = [
      Number(formData.captainJersey) || 7,
      formData.viceCaptain.trim() ? Number(formData.viceCaptainJersey) || 11 : -1,
      ...additionalPlayers.map((p) => Number(p.jerseyNumber) || 0),
    ];
    let nextJersey = 0;
    while (existing.includes(nextJersey) && nextJersey <= 99) {
      nextJersey++;
    }
    setAdditionalPlayers([
      ...additionalPlayers,
      { name: '', jerseyNumber: nextJersey, position: 'Forward' },
    ]);
  };

  const handleLoad3x3Template = () => {
    const leadershipCount = 1 + (formData.viceCaptain.trim() ? 1 : 0);
    const needed = Math.max(1, 4 - leadershipCount);
    const defaultJerseys = [23, 15, 33, 45];
    const newMembers = [];
    for (let i = 0; i < needed; i++) {
      newMembers.push({
        name: '',
        jerseyNumber: defaultJerseys[i] || i + 20,
        position: i === 0 ? 'Forward' : 'Center',
      });
    }
    setAdditionalPlayers(newMembers);
  };

  const handleLoad5x5MinTemplate = () => {
    const leadershipCount = 1 + (formData.viceCaptain.trim() ? 1 : 0);
    const needed = Math.max(1, 6 - leadershipCount);
    const defaultJerseys = [3, 5, 15, 21, 23];
    const positions = ['Guard', 'Forward', 'Center', 'Guard', 'Forward'];
    const newMembers = [];
    for (let i = 0; i < needed; i++) {
      newMembers.push({
        name: '',
        jerseyNumber: defaultJerseys[i] || i + 2,
        position: positions[i % positions.length],
      });
    }
    setAdditionalPlayers(newMembers);
  };

  const handleLoad5x5Template = () => {
    const leadershipCount = 1 + (formData.viceCaptain.trim() ? 1 : 0);
    const needed = Math.max(1, 10 - leadershipCount);
    const defaultJerseys = [3, 5, 15, 21, 23, 33, 45, 77, 99];
    const positions = ['Guard', 'Forward', 'Center', 'Guard', 'Forward', 'Center', 'Guard', 'Forward', 'Center'];
    const newMembers = [];
    for (let i = 0; i < needed; i++) {
      newMembers.push({
        name: '',
        jerseyNumber: defaultJerseys[i] || i + 2,
        position: positions[i % positions.length],
      });
    }
    setAdditionalPlayers(newMembers);
  };

  const handleAdditionalPlayerChange = (index, field, value) => {
    const updated = [...additionalPlayers];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalPlayers(updated);
  };

  const handleRemoveAdditionalPlayer = (index) => {
    setAdditionalPlayers(additionalPlayers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanCap = formData.captain.replace(/\s*\(C\)/gi, '').trim();
      const cleanVC = formData.viceCaptain.replace(/\s*\(VC\)/gi, '').trim();

      if (!cleanCap) {
        setToast({ message: 'Captain name is required!', type: 'error' });
        return;
      }

      const validPlayers = [];

      // 1. Captain (Member #1)
      validPlayers.push({
        _id: formData.captainPlayerId || undefined,
        name: `${cleanCap} (C)`,
        jerseyNumber: parseInt(formData.captainJersey, 10) || 7,
        position: formData.captainPosition || 'Guard',
        isCaptain: true,
        isViceCaptain: false,
      });

      // 2. Vice-Captain (Member #2, if provided)
      if (cleanVC) {
        validPlayers.push({
          _id: formData.viceCaptainPlayerId || undefined,
          name: `${cleanVC} (VC)`,
          jerseyNumber: parseInt(formData.viceCaptainJersey, 10) || 11,
          position: formData.viceCaptainPosition || 'Forward',
          isCaptain: false,
          isViceCaptain: true,
        });
      }

      // 3. Additional Team Members
      for (const p of additionalPlayers) {
        if (p.name && p.name.trim()) {
          validPlayers.push({
            _id: p._id || undefined,
            name: p.name.trim(),
            jerseyNumber: parseInt(p.jerseyNumber, 10) || 0,
            position: p.position || 'Guard',
            isCaptain: false,
            isViceCaptain: false,
          });
        }
      }

      const payload = {
        name: formData.name.trim(),
        shortName: formData.shortName.toUpperCase().trim(),
        logo: formData.logo,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        captain: cleanCap,
        viceCaptain: cleanVC,
        coach: cleanCap,
        players: validPlayers,
      };

      if (editingTeam) {
        await teamApi.update(editingTeam._id, payload);
        setToast({
          message: `Team "${formData.name}" and ${validPlayers.length} players (Captain & Squad) updated!`,
          type: 'success',
        });
      } else {
        await teamApi.create(payload);
        setToast({
          message: `Team "${formData.name}" created with ${validPlayers.length} players (Captain & Squad)!`,
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
              placeholder="Search team, captain, or code..."
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
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-400 mt-0.5">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                          {t.shortName}
                        </span>
                        {t.captain ? (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <span>👑</span> {t.captain}{' '}
                            <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-300 border border-amber-500/30">
                              C
                            </span>
                          </span>
                        ) : t.coach ? (
                          <span>Coach: {t.coach}</span>
                        ) : null}
                        {t.viceCaptain && (
                          <span className="text-cyan-300 font-medium flex items-center gap-1">
                            <span>🥈</span> {t.viceCaptain}{' '}
                            <span className="text-[10px] bg-cyan-500/20 px-1 rounded text-cyan-300 border border-cyan-500/30">
                              VC
                            </span>
                          </span>
                        )}
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
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <p className="text-white font-bold text-lg">No Teams Registered Yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Get started by creating your first basketball team franchise and adding player names.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create First Team & Players
            </button>
          )}
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

                  <div className="sm:col-span-2">
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

                {/* Team Captain & Vice-Captain Leadership Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Captain Input */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase font-bold text-amber-400">
                        👑 Team Captain (C) * (Member #1)
                      </label>
                      <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                        Auto-added as Player
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7">
                        <input
                          type="text"
                          value={formData.captain}
                          onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
                          placeholder="e.g. Atharv"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-white text-sm focus:border-amber-400 outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={formData.captainJersey}
                          onChange={(e) =>
                            setFormData({ ...formData, captainJersey: e.target.value })
                          }
                          title="Captain Jersey #"
                          placeholder="7"
                          className="w-full px-1 py-2 rounded-xl bg-slate-950 border border-amber-500/50 font-digital font-bold text-amber-400 text-sm text-center outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={formData.captainPosition}
                          onChange={(e) =>
                            setFormData({ ...formData, captainPosition: e.target.value })
                          }
                          className="w-full px-1 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono outline-none"
                        >
                          <option value="Guard">Guard</option>
                          <option value="Forward">Forward</option>
                          <option value="Center">Center</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vice-Captain Input (Optional) */}
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase font-bold text-cyan-400">
                        🥈 Vice-Captain (VC) [Optional] (Member #2)
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                        Optional Player
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7">
                        <input
                          type="text"
                          value={formData.viceCaptain}
                          onChange={(e) =>
                            setFormData({ ...formData, viceCaptain: e.target.value })
                          }
                          placeholder="e.g. Rohan (optional)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-white text-sm focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={formData.viceCaptainJersey}
                          onChange={(e) =>
                            setFormData({ ...formData, viceCaptainJersey: e.target.value })
                          }
                          title="Vice-Captain Jersey #"
                          placeholder="11"
                          className="w-full px-1 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 font-digital font-bold text-cyan-400 text-sm text-center outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={formData.viceCaptainPosition}
                          onChange={(e) =>
                            setFormData({ ...formData, viceCaptainPosition: e.target.value })
                          }
                          className="w-full px-1 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono outline-none"
                        >
                          <option value="Guard">Guard</option>
                          <option value="Forward">Forward</option>
                          <option value="Center">Center</option>
                        </select>
                      </div>
                    </div>
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
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono font-bold">
                      {(formData.captain.trim() ? 1 : 0) +
                        (formData.viceCaptain.trim() ? 1 : 0) +
                        additionalPlayers.filter((p) => p.name && p.name.trim()).length}{' '}
                      Players Registered
                    </span>
                  </div>

                  {/* Quick Template Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleLoad3x3Template}
                      className="px-2.5 py-1 rounded-lg bg-orange-950/60 hover:bg-orange-900 border border-orange-700/60 text-orange-300 text-[11px] font-mono font-bold transition-colors"
                      title="Populate 4 players total (including Captain & Vice-Captain)"
                    >
                      ⚡ 3x3 Roster (4)
                    </button>
                    <button
                      type="button"
                      onClick={handleLoad5x5MinTemplate}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[11px] font-mono font-bold transition-colors"
                      title="Populate minimum 6 players total (5 Starters + 1 Sub)"
                    >
                      ⚡ 5x5 Roster (Min 6)
                    </button>
                    <button
                      type="button"
                      onClick={handleLoad5x5Template}
                      className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-[11px] font-mono font-bold transition-colors"
                      title="Populate 10 players total (including Captain & Vice-Captain)"
                    >
                      ⚡ 5x5 Full (10)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAdditionalPlayer}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Member
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Captain and Vice-Captain automatically count as players with{' '}
                  <span className="text-amber-400 font-bold">(C)</span> and{' '}
                  <span className="text-cyan-400 font-bold">(VC)</span> tags. No need to re-add them below!
                </p>

                {/* Player Rows List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {/* 1. Captain (Member #1) */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/30 border border-amber-500/40">
                    <span className="w-6 text-center text-xs font-mono font-bold text-amber-400">
                      1
                    </span>

                    <div className="w-20">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={formData.captainJersey}
                        onChange={(e) =>
                          setFormData({ ...formData, captainJersey: e.target.value })
                        }
                        placeholder="#"
                        title="Captain Jersey Number"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/60 text-amber-400 font-digital font-bold text-center text-sm outline-none"
                        required
                      />
                    </div>

                    <div className="flex-1">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-sm">
                        <span className="text-white font-bold">
                          {formData.captain.trim()
                            ? `${formData.captain.replace(/\s*\(C\)/gi, '').trim()} (C)`
                            : 'Enter Captain Name in section 1 above'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-black">
                          C • CAPTAIN
                        </span>
                      </div>
                    </div>

                    <div className="w-28">
                      <select
                        value={formData.captainPosition}
                        onChange={(e) =>
                          setFormData({ ...formData, captainPosition: e.target.value })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none cursor-pointer"
                      >
                        <option value="Guard">Guard</option>
                        <option value="Forward">Forward</option>
                        <option value="Center">Center</option>
                      </select>
                    </div>

                    <div
                      className="w-8 flex justify-center text-amber-400"
                      title="Captain is automatically member #1"
                    >
                      👑
                    </div>
                  </div>

                  {/* 2. Vice-Captain (Member #2) - Included if provided */}
                  {formData.viceCaptain.trim() && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
                      <span className="w-6 text-center text-xs font-mono font-bold text-cyan-400">
                        2
                      </span>

                      <div className="w-20">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={formData.viceCaptainJersey}
                          onChange={(e) =>
                            setFormData({ ...formData, viceCaptainJersey: e.target.value })
                          }
                          placeholder="#"
                          title="Vice-Captain Jersey Number"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/60 text-cyan-400 font-digital font-bold text-center text-sm outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-sm">
                          <span className="text-white font-bold">
                            {formData.viceCaptain.replace(/\s*\(VC\)/gi, '').trim()} (VC)
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono font-black">
                            VC • VICE-CAPTAIN
                          </span>
                        </div>
                      </div>

                      <div className="w-28">
                        <select
                          value={formData.viceCaptainPosition}
                          onChange={(e) =>
                            setFormData({ ...formData, viceCaptainPosition: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none cursor-pointer"
                        >
                          <option value="Guard">Guard</option>
                          <option value="Forward">Forward</option>
                          <option value="Center">Center</option>
                        </select>
                      </div>

                      <div
                        className="w-8 flex justify-center text-cyan-400"
                        title="Vice-Captain is automatically member #2"
                      >
                        🥈
                      </div>
                    </div>
                  )}

                  {/* 3. Additional Members */}
                  {additionalPlayers.map((player, idx) => {
                    const displayIndex =
                      (formData.captain.trim() ? 1 : 0) +
                      (formData.viceCaptain.trim() ? 1 : 0) +
                      idx +
                      1;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                          {displayIndex}
                        </span>

                        <div className="w-20">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={player.jerseyNumber}
                            onChange={(e) =>
                              handleAdditionalPlayerChange(idx, 'jerseyNumber', e.target.value)
                            }
                            placeholder="#"
                            title="Jersey Number (0-99)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-digital font-bold text-center text-sm outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) =>
                              handleAdditionalPlayerChange(idx, 'name', e.target.value)
                            }
                            placeholder={`Member ${displayIndex} full name (e.g. Rahul Sharma)`}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="w-28">
                          <select
                            value={player.position}
                            onChange={(e) =>
                              handleAdditionalPlayerChange(idx, 'position', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none focus:border-orange-500 cursor-pointer"
                          >
                            <option value="Guard">Guard</option>
                            <option value="Forward">Forward</option>
                            <option value="Center">Center</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalPlayer(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Remove player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 bg-slate-900">
                <div className="text-xs font-mono text-slate-400">
                  Total:{' '}
                  <span className="text-white font-bold">
                    {(formData.captain.trim() ? 1 : 0) +
                      (formData.viceCaptain.trim() ? 1 : 0) +
                      additionalPlayers.filter((p) => p.name && p.name.trim()).length}
                  </span>{' '}
                  player(s) ready to save (including Captain & Vice-Captain)
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
