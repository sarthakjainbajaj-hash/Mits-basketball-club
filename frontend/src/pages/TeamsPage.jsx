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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamApi.update(editingTeam._id, formData);
        setToast({ message: 'Team updated successfully!', type: 'success' });
      } else {
        await teamApi.create(formData);
        setToast({ message: 'Team created successfully!', type: 'success' });
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
            <Shield className="w-8 h-8 text-orange-500" /> 3x3 Team Directory
          </h1>
          <p className="text-sm text-slate-400">
            Registered franchises, coach rosters, and official tournament records
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

      {/* Create / Edit Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">
                {editingTeam ? 'Edit Team Details' : 'Create New Team'}
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
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Thunderbolts 3x3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Short Name (3-4 Chars)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
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
                    placeholder="Vikram Mehta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{formData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{formData.secondaryColor}</span>
                  </div>
                </div>
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
                  {editingTeam ? 'Save Changes' : 'Create Team'}
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

export default TeamsPage;
