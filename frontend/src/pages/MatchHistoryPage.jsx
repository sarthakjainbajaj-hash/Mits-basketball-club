import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import { tournamentApi } from '../api/tournamentApi';
import {
  History,
  Search,
  Filter,
  Calendar,
  Trophy,
  ExternalLink,
  Flame,
  Trash2,
  Clock,
  Edit3,
  X,
  MapPin,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const PAGE_SIZE = 9;

const MatchHistoryPage = () => {
  const { isAdmin, isScorer } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(''); // '3x3', '5x5', or ''
  const [selectedStatus, setSelectedStatus] = useState(''); // 'COMPLETED', 'LIVE', 'SCHEDULED', or ''
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Quick Tab Filter: 'ALL' | 'COMPLETED' | 'SCHEDULED' | 'LIVE'
  const [quickTab, setQuickTab] = useState('ALL');

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    matchId: '',
    matchName: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [selectedFormat, selectedStatus, selectedTeam, selectedTournament]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedFormat, selectedStatus, selectedTeam, selectedTournament, sortBy, quickTab]);

  const fetchFilters = async () => {
    try {
      const [tmRes, tRes] = await Promise.all([teamApi.getAll(), tournamentApi.getAll()]);
      setTeams(tmRes?.data || []);
      setTournaments(tRes?.data || []);
    } catch (err) {
      console.error('Error fetching tournament/team filters:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedFormat) params.matchType = selectedFormat;
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

  const handleClearFilters = () => {
    setSearch('');
    setSelectedFormat('');
    setSelectedStatus('');
    setSelectedTeam('');
    setSelectedTournament('');
    setSortBy('newest');
    setQuickTab('ALL');
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      search !== '' ||
      selectedFormat !== '' ||
      selectedStatus !== '' ||
      selectedTeam !== '' ||
      selectedTournament !== '' ||
      sortBy !== 'newest' ||
      quickTab !== 'ALL'
    );
  }, [search, selectedFormat, selectedStatus, selectedTeam, selectedTournament, sortBy, quickTab]);

  // Apply quick tabs, local search (for instant reactivity), and sorting
  const filteredAndSortedMatches = useMemo(() => {
    let result = [...matches];

    // Quick Tab filtering
    if (quickTab === 'COMPLETED') {
      result = result.filter((m) => m.status === 'COMPLETED');
    } else if (quickTab === 'SCHEDULED') {
      result = result.filter((m) => m.status === 'SCHEDULED');
    } else if (quickTab === 'LIVE') {
      result = result.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED');
    }

    // Client-side search enhancement across team names and venues
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((m) => {
        const nameMatch = m.matchName?.toLowerCase().includes(q);
        const teamAMatch = m.teamA?.name?.toLowerCase().includes(q) || m.teamA?.shortName?.toLowerCase().includes(q);
        const teamBMatch = m.teamB?.name?.toLowerCase().includes(q) || m.teamB?.shortName?.toLowerCase().includes(q);
        const venueMatch = m.venue?.toLowerCase().includes(q);
        const tournamentMatch = m.tournamentId?.name?.toLowerCase().includes(q);
        return nameMatch || teamAMatch || teamBMatch || venueMatch || tournamentMatch;
      });
    }

    // Sort Order
    result.sort((a, b) => {
      const dateA = new Date(a.scheduledDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.scheduledDate || b.createdAt || 0).getTime();
      return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [matches, quickTab, search, sortBy]);

  // Status breakdown counts
  const statusCounts = useMemo(() => {
    const total = matches.length;
    const completed = matches.filter((m) => m.status === 'COMPLETED').length;
    const scheduled = matches.filter((m) => m.status === 'SCHEDULED').length;
    const live = matches.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED').length;
    return { total, completed, scheduled, live };
  }, [matches]);

  const displayedMatches = useMemo(() => {
    return filteredAndSortedMatches.slice(0, visibleCount);
  }, [filteredAndSortedMatches, visibleCount]);

  const handleDeleteMatch = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete match "${name}"?`)) {
      return;
    }
    try {
      await matchApi.delete(id);
      setToast({ message: 'Match deleted successfully', type: 'success' });
      fetchMatches();
    } catch (err) {
      setToast({ message: 'Failed to delete match: ' + err.message, type: 'error' });
    }
  };

  const handleOpenReschedule = (m) => {
    const rawDate = m.scheduledDate ? new Date(m.scheduledDate) : new Date();
    const yyyy = rawDate.getFullYear();
    const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
    const dd = String(rawDate.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setRescheduleForm({
      matchId: m._id,
      matchName: m.matchName || '',
      scheduledDate: formattedDate,
      scheduledTime: m.scheduledTime || '18:00',
      venue: m.venue || '',
    });
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.matchId) return;
    try {
      setRescheduling(true);
      await matchApi.update(rescheduleForm.matchId, {
        matchName: rescheduleForm.matchName,
        scheduledDate: rescheduleForm.scheduledDate,
        scheduledTime: rescheduleForm.scheduledTime,
        venue: rescheduleForm.venue,
      });
      setToast({ message: 'Match schedule updated successfully!', type: 'success' });
      setIsRescheduleModalOpen(false);
      fetchMatches();
    } catch (err) {
      setToast({ message: 'Failed to update schedule: ' + err.message, type: 'error' });
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
              <History className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Match Archives & Results
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Official game records, chronological box scores, and tournament archives
              </p>
            </div>
          </div>
        </div>

        {/* Quick Format Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedFormat('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              selectedFormat === ''
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setSelectedFormat('3x3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedFormat === '3x3'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏀 3x3 Basketball</span>
          </button>
          <button
            onClick={() => setSelectedFormat('5x5')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedFormat === '5x5'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏀 5x5 Basketball</span>
          </button>
        </div>
      </div>

      {/* Quick Status Category Tabs (Mobile First) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setQuickTab('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition-all whitespace-nowrap min-h-[44px] ${
            quickTab === 'ALL'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>All Matches</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickTab === 'ALL' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {statusCounts.total}
          </span>
        </button>

        <button
          onClick={() => setQuickTab('COMPLETED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition-all whitespace-nowrap min-h-[44px] ${
            quickTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickTab === 'COMPLETED' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {statusCounts.completed}
          </span>
        </button>

        <button
          onClick={() => setQuickTab('SCHEDULED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition-all whitespace-nowrap min-h-[44px] ${
            quickTab === 'SCHEDULED'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickTab === 'SCHEDULED' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {statusCounts.scheduled}
          </span>
        </button>

        {statusCounts.live > 0 && (
          <button
            onClick={() => setQuickTab('LIVE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition-all whitespace-nowrap min-h-[44px] ${
              quickTab === 'LIVE'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 animate-pulse'
                : 'bg-rose-950/40 border border-rose-800/60 text-rose-400 hover:bg-rose-950/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Now</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
              {statusCounts.live}
            </span>
          </button>
        )}
      </div>

      {/* Search & Filter Control Panel */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
        {/* Full Width Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by match title, team name, venue, or tournament..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Dropdown Filters Grid - Responsive 2 columns on mobile, 4 columns on tablet/desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-orange-500 min-h-[42px]"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="LIVE">Live Now</option>
              <option value="SCHEDULED">Upcoming Scheduled</option>
            </select>
          </div>

          {/* Tournament Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Tournament
            </label>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-orange-500 min-h-[42px] truncate"
            >
              <option value="">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-orange-500 min-h-[42px] truncate"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} {t.shortName ? `(${t.shortName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-orange-500 min-h-[42px]"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredAndSortedMatches.length}</strong> of{' '}
            <strong className="text-white">{matches.length}</strong> matches
            {filteredAndSortedMatches.length !== matches.length && ' (filtered)'}
          </div>

          {isAnyFilterActive && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 font-mono font-semibold transition-colors active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading match archives...</span>
        </div>
      ) : filteredAndSortedMatches.length > 0 ? (
        <>
          {/* Responsive Layout: 1-column on mobile, 2-column on tablet/laptop, 3-column on wide screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {displayedMatches.map((m) => {
              const isCompleted = m.status === 'COMPLETED';
              const isLive = m.status === 'LIVE' || m.status === 'PAUSED';
              const isScheduled = m.status === 'SCHEDULED';
              const is5x5 = m.matchType === '5x5';

              const scoreA = Number(m.scoreA ?? 0);
              const scoreB = Number(m.scoreB ?? 0);
              const teamAWon = isCompleted && scoreA > scoreB;
              const teamBWon = isCompleted && scoreB > scoreA;
              const isTie = isCompleted && scoreA === scoreB;

              return (
                <div
                  key={m._id}
                  className={`p-4 sm:p-5 rounded-3xl bg-slate-900/90 border transition-all flex flex-col justify-between group shadow-xl ${
                    isLive
                      ? 'border-rose-500/40 shadow-rose-950/20'
                      : isCompleted
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Status & Date Header */}
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 3x3 vs 5x5 Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                            is5x5
                              ? 'bg-blue-950/90 text-blue-400 border-blue-800'
                              : 'bg-orange-950/90 text-orange-400 border-orange-800'
                          }`}
                        >
                          {is5x5 ? '5x5 Classic' : '3x3 Circuit'}
                        </span>

                        {/* Match Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            isLive
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse flex items-center gap-1'
                              : isCompleted
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                          }`}
                        >
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                          {isLive ? 'LIVE NOW' : isCompleted ? 'FINAL' : 'UPCOMING'}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <span className="flex items-center gap-1.5 text-slate-400 text-[11px] whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(m.scheduledDate || m.createdAt).toLocaleDateString()}{' '}
                          {m.scheduledTime ? `@ ${m.scheduledTime}` : ''}
                        </span>
                      </span>
                    </div>

                    {/* Match Name & Tournament Metadata */}
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-orange-400 transition-colors leading-snug">
                        {m.matchName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1 flex-wrap">
                        <span className="flex items-center gap-1 truncate text-slate-300">
                          <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="truncate">
                            {m.tournamentId?.name || (is5x5 ? '5x5 Championship' : 'MITS 3x3 Tour')}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{m.venue || 'Center Basketball Court'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Interactive Scoreboard Display Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                      {/* Team A Row */}
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                          teamAWon
                            ? 'bg-amber-500/10 border border-amber-500/30'
                            : 'bg-slate-900/60 border border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              teamAWon ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.teamA?.shortName?.slice(0, 3) || 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-sm sm:text-base font-bold leading-tight ${
                                  teamAWon ? 'text-white' : 'text-slate-200'
                                }`}
                              >
                                {m.teamA?.name || 'Team A'}
                              </span>
                              {teamAWon && (
                                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                                  <Trophy className="w-2.5 h-2.5" /> WINNER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              {m.teamA?.shortName && m.teamA.shortName !== m.teamA.name && (
                                <span className="text-slate-500">[{m.teamA.shortName}]</span>
                              )}
                              <span>Fouls: {m.foulsA || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`font-digital font-black text-2xl sm:text-3xl tracking-wider px-3 py-1 rounded-lg flex-shrink-0 ${
                            teamAWon
                              ? 'text-amber-400'
                              : isCompleted
                              ? 'text-slate-400'
                              : isLive
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {scoreA}
                        </div>
                      </div>

                      {/* Team B Row */}
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                          teamBWon
                            ? 'bg-amber-500/10 border border-amber-500/30'
                            : 'bg-slate-900/60 border border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              teamBWon ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.teamB?.shortName?.slice(0, 3) || 'B'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-sm sm:text-base font-bold leading-tight ${
                                  teamBWon ? 'text-white' : 'text-slate-200'
                                }`}
                              >
                                {m.teamB?.name || 'Team B'}
                              </span>
                              {teamBWon && (
                                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                                  <Trophy className="w-2.5 h-2.5" /> WINNER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              {m.teamB?.shortName && m.teamB.shortName !== m.teamB.name && (
                                <span className="text-slate-500">[{m.teamB.shortName}]</span>
                              )}
                              <span>Fouls: {m.foulsB || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`font-digital font-black text-2xl sm:text-3xl tracking-wider px-3 py-1 rounded-lg flex-shrink-0 ${
                            teamBWon
                              ? 'text-amber-400'
                              : isCompleted
                              ? 'text-slate-400'
                              : isLive
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {scoreB}
                        </div>
                      </div>
                    </div>

                    {/* Quarter Breakdown Strip (When available) */}
                    {m.periodScores && m.periodScores.length > 0 && (
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 py-1 bg-slate-950/60 rounded-xl border border-slate-800/60 overflow-x-auto scrollbar-none">
                        <span className="text-slate-500 uppercase font-bold px-1">Periods:</span>
                        {m.periodScores.map((ps) => (
                          <span
                            key={ps.period}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 whitespace-nowrap"
                          >
                            {ps.period}: {ps.scoreA}-{ps.scoreB}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Winner Banner for Completed Matches */}
                    {isCompleted && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5 min-w-0 pr-2">
                          <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="truncate">
                            {scoreA > scoreB
                              ? `${m.teamA?.name || 'Team A'} wins by ${scoreA - scoreB} ${scoreA - scoreB === 1 ? 'point' : 'points'}`
                              : scoreB > scoreA
                              ? `${m.teamB?.name || 'Team B'} wins by ${scoreB - scoreA} ${scoreB - scoreA === 1 ? 'point' : 'points'}`
                              : `Match Tied (${scoreA} - ${scoreB})`}
                          </span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex-shrink-0">
                          Final Result
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer - 44px minimum touch targets */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    {/* Reschedule button for scheduled matches (Admins & Scorers) */}
                    {isScheduled && (isAdmin || isScorer) && (
                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(m)}
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 min-h-[44px]"
                        title="Edit Date, Timing & Court"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Reschedule</span>
                      </button>
                    )}

                    {/* Primary Match Link */}
                    <Link
                      to={isLive ? `/live/${m._id}` : `/matches/${m._id}`}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                        isLive
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white border border-slate-700/60 hover:border-orange-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>
                        {isLive
                          ? 'Watch Live Scoreboard'
                          : isCompleted
                          ? 'View Official Box Score'
                          : 'Match Staging / Preview'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </Link>

                    {/* Delete Match Button (Admin & Scorer) */}
                    {(isAdmin || isScorer) && (
                      <button
                        onClick={() => handleDeleteMatch(m._id, m.matchName)}
                        title="Delete Match"
                        className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-400 hover:text-rose-200 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Delete Match Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Pagination Button */}
          {visibleCount < filteredAndSortedMatches.length && (
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 min-h-[48px]"
              >
                <span>Load More Matches</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px]">
                  +{Math.min(PAGE_SIZE, filteredAndSortedMatches.length - visibleCount)}
                </span>
              </button>

              <button
                onClick={() => setVisibleCount(filteredAndSortedMatches.length)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 underline underline-offset-4 py-2"
              >
                Show All ({filteredAndSortedMatches.length})
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">No Matching Matches Found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              We couldn't find any match records matching your active filters or search terms. Try searching with a different keyword or resetting filters.
            </p>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono shadow-md shadow-orange-600/30 transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Reschedule Match Modal (Preserved & Enhanced) */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 rounded-xl"
              aria-label="Close Reschedule Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Reschedule Match</h3>
                <p className="text-xs text-slate-400 font-mono">Update scheduled date, kick-off time, and venue</p>
              </div>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Match Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={rescheduleForm.matchName}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, matchName: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.scheduledDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleForm.scheduledTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduledTime: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Court / Venue
                </label>
                <input
                  type="text"
                  value={rescheduleForm.venue}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, venue: e.target.value })}
                  placeholder="e.g. Main Court, Court 2"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {rescheduling ? 'Saving Schedule...' : 'Save Schedule'}
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

export default MatchHistoryPage;
