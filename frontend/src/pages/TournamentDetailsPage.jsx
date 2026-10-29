import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tournamentApi } from '../api/tournamentApi';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  PlayCircle,
  Play,
  ExternalLink,
  Sparkles,
  Trash2,
  Plus,
  X,
  Clock,
  Sliders,
  CheckCircle2,
  Search,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Zap,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isScorer } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'matches' | 'teams'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fixtures Sub-filter
  const [fixtureFilter, setFixtureFilter] = useState('all'); // 'all' | 'scheduled' | 'live' | 'completed'

  // Add Team Modal State
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [allTeams, setAllTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [addingTeamId, setAddingTeamId] = useState(null);

  // Edit Tournament Modal State
  const [isEditTournamentModalOpen, setIsEditTournamentModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(false);
  const [editTournamentForm, setEditTournamentForm] = useState({
    name: '',
    format: '5x5',
    organizer: '',
    venue: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'UPCOMING',
  });

  // Auto-Generate Fixtures Modal State
  const [isAutoFixtureModalOpen, setIsAutoFixtureModalOpen] = useState(false);
  const [generatingFixtures, setGeneratingFixtures] = useState(false);
  const [autoFixtureForm, setAutoFixtureForm] = useState({
    matchType: '5x5',
    matchStructure: 'HALVES',
    quarterDuration: 900,
    shotClock: 24,
    venue: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    intervalMinutes: 60,
  });

  // Fix Match Modal State
  const [isFixMatchModalOpen, setIsFixMatchModalOpen] = useState(false);
  const [fixingMatch, setFixingMatch] = useState(false);
  const [startingMatchId, setStartingMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState({
    matchName: '',
    matchType: '5x5',
    matchStructure: 'QUARTERS', // 'QUARTERS' | 'HALVES' | 'SINGLE'
    quarterDuration: 600, // in seconds (600 = 10m, 900 = 15m, etc.)
    shotClock: 24, // 24, 14, 12, or 0 (Off)
    teamA: '',
    teamB: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '18:00',
    venue: '',
  });

  // Reschedule Match Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [reschedulingMatch, setReschedulingMatch] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    matchId: '',
    matchName: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
    matchStructure: 'QUARTERS',
    quarterDuration: 600,
    shotClock: 24,
  });

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes, teamsRes] = await Promise.allSettled([
        tournamentApi.getById(id),
        tournamentApi.getStandings(id),
        teamApi.getAll(),
      ]);
      if (tRes.status === 'fulfilled') setTournament(tRes.value?.data || null);
      if (sRes.status === 'fulfilled') setStandings(sRes.value?.data || []);
      if (teamsRes.status === 'fulfilled') setAllTeams(teamsRes.value?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load tournament: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete tournament "${tournament.name}"? Matches in this tournament will be preserved but unlinked.`
      )
    ) {
      return;
    }
    try {
      await tournamentApi.delete(id);
      setToast({ message: `Tournament "${tournament.name}" deleted successfully`, type: 'success' });
      setTimeout(() => {
        navigate('/tournaments');
      }, 500);
    } catch (err) {
      setToast({ message: 'Failed to delete tournament: ' + err.message, type: 'error' });
    }
  };

  const handleDeleteMatch = async (matchId, matchName) => {
    if (!window.confirm(`Are you sure you want to permanently delete match "${matchName}"?`)) {
      return;
    }
    try {
      await matchApi.delete(matchId);
      setToast({ message: 'Match deleted successfully', type: 'success' });
      fetchTournamentData();
    } catch (err) {
      setToast({ message: 'Failed to delete match: ' + err.message, type: 'error' });
    }
  };

  // Open Add Team Modal & Load Directory
  const handleOpenAddTeamModal = async () => {
    setIsAddTeamModalOpen(true);
    setTeamSearch('');
    try {
      setTeamsLoading(true);
      const res = await teamApi.getAll();
      setAllTeams(res?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load teams: ' + err.message, type: 'error' });
    } finally {
      setTeamsLoading(false);
    }
  };

  // Add Team to Tournament
  const handleAddTeam = async (teamId) => {
    try {
      setAddingTeamId(teamId);
      await tournamentApi.addTeam(id, teamId);
      setToast({ message: 'Team successfully added to tournament!', type: 'success' });
      await fetchTournamentData();
    } catch (err) {
      setToast({
        message: 'Failed to add team: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setAddingTeamId(null);
    }
  };

  // Remove Team from Tournament
  const handleRemoveTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to remove team "${teamName}" from this tournament?`)) {
      return;
    }
    try {
      await tournamentApi.removeTeam(id, teamId);
      setToast({ message: `Team "${teamName}" removed from tournament`, type: 'success' });
      await fetchTournamentData();
    } catch (err) {
      setToast({
        message: 'Failed to remove team: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    }
  };

  // Open Edit Tournament Modal
  const handleOpenEditTournamentModal = () => {
    if (!tournament) return;
    setEditTournamentForm({
      name: tournament.name || '',
      format: tournament.format || '5x5',
      organizer: tournament.organizer || '',
      venue: tournament.venue || '',
      startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().split('T')[0] : '',
      endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().split('T')[0] : '',
      description: tournament.description || '',
      status: tournament.status || 'UPCOMING',
    });
    setIsEditTournamentModalOpen(true);
  };

  const handleEditTournamentSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditingTournament(true);
      const res = await tournamentApi.update(id, editTournamentForm);
      setToast({ message: 'Tournament details updated successfully!', type: 'success' });
      setIsEditTournamentModalOpen(false);
      setTournament((prev) => ({ ...prev, ...res?.data }));
      await fetchTournamentData();
    } catch (err) {
      setToast({
        message: 'Failed to update tournament: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setEditingTournament(false);
    }
  };

  // Open Auto-Generate Fixtures Modal
  const handleOpenAutoFixtureModal = () => {
    setAutoFixtureForm({
      matchType: tournament?.format || '5x5',
      matchStructure: 'HALVES',
      quarterDuration: 900,
      shotClock: 24,
      venue: tournament?.venue || 'Main Court',
      startDate: tournament?.startDate
        ? new Date(tournament.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      startTime: '10:00',
      intervalMinutes: 60,
    });
    setIsAutoFixtureModalOpen(true);
  };

  const handleAutoFixtureSubmit = async (e) => {
    e.preventDefault();
    if ((tournament?.teams || []).length < 2) {
      setToast({ message: 'At least 2 teams required to generate fixtures', type: 'error' });
      return;
    }
    try {
      setGeneratingFixtures(true);
      const res = await tournamentApi.generateFixtures(id, autoFixtureForm);
      setToast({ message: res?.message || 'Successfully generated round-robin fixtures!', type: 'success' });
      setIsAutoFixtureModalOpen(false);
      await fetchTournamentData();
      setActiveTab('matches');
    } catch (err) {
      setToast({
        message: 'Failed to generate fixtures: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setGeneratingFixtures(false);
    }
  };

  const getTeamId = (t) => {
    if (!t) return '';
    return (t._id ? t._id.toString() : t.toString()) || '';
  };

  const getTeamName = (t) => {
    if (!t) return 'Unknown Team';
    if (typeof t === 'object' && t.name) return t.name;
    const tid = getTeamId(t);
    const found = allTeams.find((item) => getTeamId(item) === tid);
    return found?.name || (typeof t === 'object' && t.shortName) || (found?.shortName) || `Team (${tid ? tid.slice(-4) : '?'})`;
  };

  // Open Fix Match Modal
  const handleOpenFixMatchModal = () => {
    const teamsList = (tournament?.teams || []).filter(Boolean);
    const defaultName = `Match ${(tournament?.matches?.length || 0) + 1}`;
    const tFormat = tournament?.format === '3x3' ? '3x3' : '5x5';
    const idA = teamsList[0] ? getTeamId(teamsList[0]) : '';
    const idB = teamsList[1] ? getTeamId(teamsList[1]) : '';

    setMatchForm({
      matchName: defaultName,
      matchType: tFormat,
      matchStructure: tFormat === '3x3' ? 'SINGLE' : 'QUARTERS',
      quarterDuration: tFormat === '3x3' ? 600 : 600,
      shotClock: tFormat === '3x3' ? 12 : 24,
      teamA: idA,
      teamB: idB,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '18:00',
      venue: tournament?.venue || 'Main Court',
    });
    setIsFixMatchModalOpen(true);
  };

  // Fix Match Form Submission
  const handleFixMatchSubmit = async (e) => {
    e.preventDefault();
    if (!matchForm.teamA || !matchForm.teamB) {
      setToast({ message: 'Please select both Team A and Team B', type: 'error' });
      return;
    }
    if (matchForm.teamA === matchForm.teamB) {
      setToast({ message: 'Team A and Team B cannot be the same team', type: 'error' });
      return;
    }
    try {
      setFixingMatch(true);
      await matchApi.create({
        ...matchForm,
        tournamentId: id,
        settings: {
          matchStructure: matchForm.matchType === '3x3' ? 'SINGLE' : matchForm.matchStructure,
          quarterDuration: Number(matchForm.quarterDuration),
          gameDuration: Number(matchForm.quarterDuration),
          shotClock: Number(matchForm.shotClock),
          numberOfQuarters: matchForm.matchStructure === 'HALVES' ? 2 : (matchForm.matchType === '3x3' ? 1 : 4),
        },
      });
      setToast({ message: 'Match fixture created and scheduled successfully!', type: 'success' });
      setIsFixMatchModalOpen(false);
      await fetchTournamentData();
      setActiveTab('matches');
    } catch (err) {
      setToast({
        message: 'Failed to fix match: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setFixingMatch(false);
    }
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (m) => {
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
      matchStructure: m.settings?.matchStructure || (m.matchType === '5x5' ? 'QUARTERS' : 'SINGLE'),
      quarterDuration: m.settings?.quarterDuration || m.gameDuration || 600,
      shotClock: m.settings?.shotClock !== undefined ? m.settings.shotClock : (m.matchType === '5x5' ? 24 : 12),
    });
    setIsRescheduleModalOpen(true);
  };

  // Submit Reschedule / Edit Match Timing
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.matchId) return;
    try {
      setReschedulingMatch(true);
      await matchApi.update(rescheduleForm.matchId, {
        matchName: rescheduleForm.matchName,
        scheduledDate: rescheduleForm.scheduledDate,
        scheduledTime: rescheduleForm.scheduledTime,
        venue: rescheduleForm.venue,
        'settings.matchStructure': rescheduleForm.matchStructure,
        'settings.quarterDuration': Number(rescheduleForm.quarterDuration),
        'settings.gameDuration': Number(rescheduleForm.quarterDuration),
        'settings.shotClock': Number(rescheduleForm.shotClock),
        'settings.numberOfQuarters': rescheduleForm.matchStructure === 'HALVES' ? 2 : 4,
        quarterDuration: Number(rescheduleForm.quarterDuration),
        gameDuration: Number(rescheduleForm.quarterDuration),
        shotClock: Number(rescheduleForm.shotClock),
      });
      setToast({ message: 'Match schedule & timing updated successfully!', type: 'success' });
      setIsRescheduleModalOpen(false);
      await fetchTournamentData();
    } catch (err) {
      setToast({
        message: 'Failed to update schedule: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setReschedulingMatch(false);
    }
  };

  // Direct Start Match Action
  const handleStartMatch = async (matchId) => {
    try {
      setStartingMatchId(matchId);
      await matchApi.start(matchId);
      navigate(`/matches/${matchId}/live`);
    } catch (err) {
      setToast({
        message: 'Failed to start match: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setStartingMatchId(null);
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

  const filteredMatches = matches.filter((m) => {
    if (fixtureFilter === 'scheduled') return m.status === 'SCHEDULED';
    if (fixtureFilter === 'live') return m.status === 'LIVE' || m.status === 'PAUSED';
    if (fixtureFilter === 'completed') return m.status === 'COMPLETED';
    return true;
  });

  const tournamentTeams = (tournament.teams || []).filter(Boolean);
  const tournamentTeamIds = tournamentTeams.map((t) => getTeamId(t)).filter(Boolean);

  const searchedTeams = allTeams.filter((t) =>
    t.name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
    t.shortName?.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 overflow-x-hidden">
      {/* Back Link & Admin Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </Link>

        {(isAdmin || isScorer) && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenEditTournamentModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
              title="Edit Tournament Details"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={handleOpenAutoFixtureModal}
              disabled={tournamentTeams.length < 2}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title={tournamentTeams.length < 2 ? 'Add at least 2 teams first' : 'Auto-Generate Round-Robin Fixtures'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-200" />
              <span>Auto-Generate Fixtures</span>
            </button>
            <button
              onClick={handleOpenFixMatchModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Fix / Schedule Match</span>
            </button>
            <button
              onClick={handleDeleteTournament}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-white font-bold text-xs border border-red-800/60 shadow transition-all active:scale-95"
              title="Delete Tournament"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Tournament</span>
            </button>
          </div>
        )}
      </div>

      {/* Tournament Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {tournament.status}
            </span>
            <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              🏀 {tournament.format || '5x5'} Format
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

          {tournament.description && (
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {tournament.description}
            </p>
          )}

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
              <span className="font-bold text-amber-400">{tournamentTeams.length}</span>
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
            Fixtures & Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Teams ({tournamentTeams.length})
          </button>
        </div>
      </div>

      {/* Tab: Standings Table */}
      {activeTab === 'standings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">
                {tournament.format === '3x3' ? 'FIBA 3x3 Standings' : 'Tournament Points Table & Standings'}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Ranked by: PTS (Wins) &gt; Win% &gt; Diff &gt; Points For
            </span>
          </div>

          <div className="overflow-x-auto w-full max-w-full pb-2">
            <table className="w-full min-w-[680px] text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-center">Played</th>
                  <th className="py-3 px-3 text-center text-emerald-400 font-bold">Won</th>
                  <th className="py-3 px-3 text-center text-red-400">Lost</th>
                  <th className="py-3 px-3 text-center text-slate-400">Draw</th>
                  <th className="py-3 px-3 text-center text-amber-400 font-bold">PF</th>
                  <th className="py-3 px-3 text-center">PA</th>
                  <th className="py-3 px-3 text-center font-bold">Diff</th>
                  <th className="py-3 px-3 text-center text-cyan-400 font-bold">Win%</th>
                  <th className="py-3 px-3 text-center text-orange-400 font-bold">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs sm:text-sm">
                {standings.length > 0 ? (
                  standings.map((st, idx) => (
                    <tr key={st.teamId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
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
                      <td className="py-3.5 px-3 text-center text-slate-400">{st.draw || 0}</td>
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
                      <td className="py-3.5 px-3 text-center font-digital text-cyan-400 font-bold">
                        {st.winPct || '.000'}
                      </td>
                      <td className="py-3.5 px-3 text-center font-digital font-bold text-orange-400 text-base bg-orange-500/10">
                        {st.pts || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                      No match results recorded in this tournament yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Fixtures & Matches List */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Sub-Filters and Fix Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: 'all', label: `All Fixtures (${matches.length})` },
                { key: 'scheduled', label: `Scheduled (${upcomingMatches.length})` },
                { key: 'live', label: `Live (${liveMatches.length})` },
                { key: 'completed', label: `Completed (${completedMatches.length})` },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFixtureFilter(filter.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                    fixtureFilter === filter.key
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {(isAdmin || isScorer) && (
              <button
                onClick={handleOpenFixMatchModal}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Fix / Schedule Match</span>
              </button>
            )}
          </div>

          {/* Fixtures Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((m) => {
                const isLive = m.status === 'LIVE' || m.status === 'PAUSED';
                const isCompleted = m.status === 'COMPLETED';
                const isScheduled = m.status === 'SCHEDULED';

                return (
                  <div
                    key={m._id}
                    className={`p-5 rounded-3xl bg-slate-900/90 border transition-all flex flex-col justify-between ${
                      isLive
                        ? 'border-red-500/50 shadow-lg shadow-red-950/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded font-bold uppercase text-[11px] ${
                              isLive
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                : isCompleted
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isLive && '● '}
                            {m.status}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 text-[10px] font-bold border border-cyan-800/40">
                            {m.matchType || '3x3'}
                            {m.settings?.matchStructure === 'HALVES' ? ' • 2 Halves' : m.matchType === '5x5' ? ' • 4Q' : ''}
                          </span>
                        </div>

                        {isScheduled && (isAdmin || isScorer) ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRescheduleModal(m)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700/80 transition-all text-xs font-mono font-bold group flex-shrink-0"
                            title="Click to edit match date & timing"
                          >
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>{new Date(m.scheduledDate).toLocaleDateString()} @ {m.scheduledTime || '18:00'}</span>
                            <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-white" />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(m.scheduledDate).toLocaleDateString()} @ {m.scheduledTime || '18:00'}
                          </span>
                        )}
                      </div>

                      {/* Match Name & Venue */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h4 className="font-bold text-white text-base tracking-tight truncate min-w-0 max-w-[70%]">{m.matchName}</h4>
                        {m.venue && (
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 flex-shrink-0">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {m.venue}
                          </span>
                        )}
                      </div>

                      {/* Scoreboard Display Box */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-2">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[38%]">
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: m.teamA?.primaryColor || '#FF5722' }}
                          />
                          <span className="font-bold text-white text-sm truncate">
                            {m.teamA?.name || 'Team A'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-digital font-bold text-amber-400 text-xl px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 tracking-[0.16em] flex-shrink-0">
                          <span>{m.scoreA ?? 0}</span>
                          <span className="text-slate-600 text-sm font-sans">-</span>
                          <span>{m.scoreB ?? 0}</span>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-0 max-w-[38%] justify-end">
                          <span className="font-bold text-white text-sm truncate text-right">
                            {m.teamB?.name || 'Team B'}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: m.teamB?.primaryColor || '#3B82F6' }}
                          />
                        </div>
                      </div>

                      {/* Winner Display on Completed Match */}
                      {isCompleted && (
                        <div className="mt-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="truncate">
                              {Number(m.scoreA ?? 0) > Number(m.scoreB ?? 0)
                                ? `${m.teamA?.name || 'Team A'} wins by ${Number(m.scoreA) - Number(m.scoreB)} ${Number(m.scoreA) - Number(m.scoreB) === 1 ? 'point' : 'points'}`
                                : Number(m.scoreB ?? 0) > Number(m.scoreA ?? 0)
                                ? `${m.teamB?.name || 'Team B'} wins by ${Number(m.scoreB) - Number(m.scoreA)} ${Number(m.scoreB) - Number(m.scoreA) === 1 ? 'point' : 'points'}`
                                : `Match Tied (${m.scoreA ?? 0} - ${m.scoreB ?? 0})`}
                            </span>
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex-shrink-0 ml-2">
                            Final
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60">
                      <div>
                        {(isAdmin || isScorer) && (
                          <button
                            onClick={() => handleDeleteMatch(m._id, m.matchName)}
                            title="Delete Match"
                            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-400 hover:text-red-200 text-xs font-mono transition-all active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 justify-end flex-1">
                        {isCompleted && (
                          <Link
                            to={`/matches/${m._id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                          >
                            <span>Match Report</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {isLive && (
                          <Link
                            to={`/matches/${m._id}/live`}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all active:scale-95"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Live Scoreboard</span>
                          </Link>
                        )}

                        {isScheduled && (isAdmin || isScorer) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenRescheduleModal(m)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                              title="Edit Date, Timing & Court"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Reschedule</span>
                            </button>

                            <Link
                              to={`/matches/${m._id}/setup`}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all"
                              title="Configure Lineups & Clock"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Setup</span>
                            </Link>

                            <button
                              onClick={() => handleStartMatch(m._id)}
                              disabled={startingMatchId === m._id}
                              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{startingMatchId === m._id ? 'Starting...' : 'Start Match'}</span>
                            </button>
                          </>
                        )}

                        {isScheduled && !isAdmin && !isScorer && (
                          <span className="text-xs text-slate-500 font-mono italic">
                            Upcoming match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
                <p className="text-slate-400 font-medium text-sm">
                  No fixtures match the current filter.
                </p>
                {(isAdmin || isScorer) && (
                  <button
                    onClick={handleOpenFixMatchModal}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Fix First Match</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Participating Teams */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Participating Teams</h3>
              <p className="text-xs text-slate-400">
                Teams registered in this tournament roster ({tournamentTeams.length})
              </p>
            </div>

            {(isAdmin || isScorer) && (
              <button
                onClick={handleOpenAddTeamModal}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Teams to Tournament</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tournamentTeams.length > 0 ? (
              tournamentTeams.map((tm) => {
                const tmId = getTeamId(tm);
                const tmName = getTeamName(tm);
                const tmColor = tm?.primaryColor || '#FF5722';
                const tmShort = tm?.shortName || tmName.slice(0, 3);
                const tmCoach = tm?.coach || 'Head Coach';

                return (
                  <div
                    key={tmId}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: tmColor }}
                    />

                    <Link to={`/teams/${tmId}`} className="flex flex-col items-center text-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-digital font-bold text-white text-xl shadow-md mb-3 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: tmColor }}
                      >
                        {tmShort}
                      </div>
                      <h4 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                        {tmName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Coach: {tmCoach}
                      </p>
                    </Link>

                    {(isAdmin || isScorer) && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <Link
                          to={`/teams/${tmId}`}
                          className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1"
                        >
                          <span>Roster</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          onClick={() => handleRemoveTeam(tmId, tmName)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/80 border border-red-800/40 text-red-400 hover:text-white text-xs font-mono transition-all"
                          title="Remove from tournament"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
                <p className="text-slate-400 font-medium text-sm">
                  No teams assigned to this tournament yet.
                </p>
                {(isAdmin || isScorer) && (
                  <button
                    onClick={handleOpenAddTeamModal}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Teams Now</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD TEAM TO TOURNAMENT */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Add Teams to Tournament</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Select teams from the directory to add to {tournament.name}
                </p>
              </div>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teams by name..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* Teams List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {teamsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchedTeams.length > 0 ? (
                searchedTeams.map((team) => {
                  const isAlreadyAdded = tournamentTeamIds.includes(team._id.toString());

                  return (
                    <div
                      key={team._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-digital font-bold text-white text-xs shadow"
                          style={{ backgroundColor: team.primaryColor || '#FF5722' }}
                        >
                          {team.shortName || team.name?.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{team.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {team.coach ? `Coach: ${team.coach}` : team.shortName}
                          </p>
                        </div>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Tournament</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddTeam(team._id)}
                          disabled={addingTeamId === team._id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{addingTeamId === team._id ? 'Adding...' : 'Add Team'}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No teams found. You can create a new team in the Teams section.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FIX / SCHEDULE MATCH MODAL */}
      {isFixMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="font-bold text-white text-lg">Fix Match / Schedule Fixture</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Schedule match in {tournament.name}. Lineups are auto-initialized.
                </p>
              </div>
              <button
                onClick={() => setIsFixMatchModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tournamentTeams.length < 2 ? (
              <div className="p-6 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-white text-base">At least 2 Teams Required</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    You currently have {tournamentTeams.length} team(s) in this tournament. Please add
                    at least 2 teams before fixing a match.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsFixMatchModalOpen(false);
                    handleOpenAddTeamModal();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all"
                >
                  Add Teams to Tournament
                </button>
              </div>
            ) : (
              <form onSubmit={handleFixMatchSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Title / Round Name
                  </label>
                  <input
                    type="text"
                    required
                    value={matchForm.matchName}
                    onChange={(e) => setMatchForm({ ...matchForm, matchName: e.target.value })}
                    placeholder="e.g. Round Robin 1, Semi-Final 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMatchForm({
                        ...matchForm,
                        matchType: '5x5',
                        matchStructure: 'QUARTERS',
                        quarterDuration: 600,
                        shotClock: 24,
                      })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        matchForm.matchType === '5x5'
                          ? 'border-cyan-500 bg-cyan-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="font-bold text-xs text-cyan-400">FIBA 5x5 Full Court</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Quarters or Halves | 24s Clock</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchForm({
                        ...matchForm,
                        matchType: '3x3',
                        matchStructure: 'SINGLE',
                        quarterDuration: 600,
                        shotClock: 12,
                      })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        matchForm.matchType === '3x3'
                          ? 'border-orange-500 bg-orange-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="font-bold text-xs text-orange-400">FIBA 3x3 Half Court</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">1 Period (10:00) | 12s Clock</p>
                    </button>
                  </div>
                </div>

                {/* Timing & Structure Configuration */}
                {matchForm.matchType === '5x5' && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Game Structure
                        </label>
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          {matchForm.matchStructure === 'HALVES' ? '2 Halves' : '4 Quarters'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMatchForm({
                            ...matchForm,
                            matchStructure: 'QUARTERS',
                            quarterDuration: matchForm.quarterDuration === 900 ? 600 : matchForm.quarterDuration,
                          })}
                          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                            matchForm.matchStructure === 'QUARTERS'
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          4 Quarters (FIBA)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMatchForm({
                            ...matchForm,
                            matchStructure: 'HALVES',
                            quarterDuration: 900, // 15 min default for college halves
                          })}
                          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                            matchForm.matchStructure === 'HALVES'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          2 Halves (College)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          {matchForm.matchStructure === 'HALVES' ? 'Duration per Half' : 'Duration per Quarter'}
                        </label>
                        <span className="text-[11px] font-mono font-bold text-white">
                          {Math.floor(matchForm.quarterDuration / 60)}:00 Mins
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(matchForm.matchStructure === 'HALVES'
                          ? [
                              { label: '10 Min', val: 600 },
                              { label: '15 Min', val: 900 },
                              { label: '20 Min', val: 1200 },
                              { label: '25 Min', val: 1500 },
                            ]
                          : [
                              { label: '5 Min', val: 300 },
                              { label: '8 Min', val: 480 },
                              { label: '10 Min', val: 600 },
                              { label: '12 Min', val: 720 },
                            ]
                        ).map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setMatchForm({ ...matchForm, quarterDuration: opt.val })}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                              matchForm.quarterDuration === opt.val
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Shot Clock
                        </label>
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          {matchForm.shotClock === 0 ? 'Disabled (OFF)' : `${matchForm.shotClock} Seconds`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: '24 Seconds', val: 24 },
                          { label: '14 Seconds', val: 14 },
                          { label: 'Off / None', val: 0 },
                        ].map((sc) => (
                          <button
                            key={sc.val}
                            type="button"
                            onClick={() => setMatchForm({ ...matchForm, shotClock: sc.val })}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                              matchForm.shotClock === sc.val
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {matchForm.matchType === '3x3' && (
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">FIBA 3x3 Duration:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { label: '8m', val: 480 },
                        { label: '10m (Official)', val: 600 },
                        { label: '12m', val: 720 },
                      ].map((dur) => (
                        <button
                          key={dur.val}
                          type="button"
                          onClick={() => setMatchForm({ ...matchForm, quarterDuration: dur.val })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            matchForm.quarterDuration === dur.val
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Team A
                    </label>
                    <select
                      required
                      value={matchForm.teamA}
                      onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select Team A</option>
                      {tournamentTeams.map((t) => {
                        const tid = getTeamId(t);
                        const tname = getTeamName(t);
                        return (
                          <option key={tid} value={tid} disabled={tid === matchForm.teamB}>
                            {tname}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Team B
                    </label>
                    <select
                      required
                      value={matchForm.teamB}
                      onChange={(e) => setMatchForm({ ...matchForm, teamB: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select Team B</option>
                      {tournamentTeams.map((t) => {
                        const tid = getTeamId(t);
                        const tname = getTeamName(t);
                        return (
                          <option key={tid} value={tid} disabled={tid === matchForm.teamA}>
                            {tname}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={matchForm.scheduledDate}
                      onChange={(e) => setMatchForm({ ...matchForm, scheduledDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={matchForm.scheduledTime}
                      onChange={(e) => setMatchForm({ ...matchForm, scheduledTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Court / Venue
                  </label>
                  <input
                    type="text"
                    value={matchForm.venue}
                    onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                    placeholder="e.g. Main Court, Court 2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFixMatchModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fixingMatch}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all disabled:opacity-50"
                  >
                    {fixingMatch ? 'Scheduling Fixture...' : 'Schedule Fixture'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Tournament Modal */}
      {isEditTournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditTournamentModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Edit Tournament</h3>
                <p className="text-xs text-slate-400 font-mono">Update tournament format, schedule, and metadata</p>
              </div>
            </div>

            <form onSubmit={handleEditTournamentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  value={editTournamentForm.name}
                  onChange={(e) => setEditTournamentForm({ ...editTournamentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Tournament Format
                  </label>
                  <select
                    value={editTournamentForm.format}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, format: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="5x5">🏀 5x5 College / Full Court</option>
                    <option value="3x3">🏀 3x3 Half Court</option>
                    <option value="OPEN">🌐 Open Format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Tournament Status
                  </label>
                  <select
                    value={editTournamentForm.status}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={editTournamentForm.organizer}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, organizer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={editTournamentForm.venue}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editTournamentForm.startDate}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editTournamentForm.endDate}
                    onChange={(e) => setEditTournamentForm({ ...editTournamentForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editTournamentForm.description}
                  onChange={(e) => setEditTournamentForm({ ...editTournamentForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditTournamentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingTournament}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
                >
                  {editingTournament ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Fixtures Modal */}
      {isAutoFixtureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAutoFixtureModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Auto-Generate Fixtures</h3>
                <p className="text-xs text-slate-400 font-mono">Round-Robin schedule generator (Berger algorithm)</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">Registered Teams</span>
                <span className="text-xs font-mono font-bold text-white bg-amber-500/30 px-2 py-0.5 rounded-md">
                  {tournamentTeams.length} Teams
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Will auto-create{' '}
                <span className="font-bold text-amber-400">
                  {(tournamentTeams.length * (tournamentTeams.length - 1)) / 2} matches
                </span>{' '}
                so every team plays against every other team once.
              </p>
            </div>

            <form onSubmit={handleAutoFixtureSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Format
                  </label>
                  <select
                    value={autoFixtureForm.matchType}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, matchType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="5x5">🏀 5x5 College / Full Court</option>
                    <option value="3x3">🏀 3x3 Half Court</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Structure
                  </label>
                  <select
                    value={autoFixtureForm.matchStructure}
                    onChange={(e) =>
                      setAutoFixtureForm({
                        ...autoFixtureForm,
                        matchStructure: e.target.value,
                        quarterDuration: e.target.value === 'HALVES' ? 900 : 600,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="HALVES">2 Halves (College Standard)</option>
                    <option value="QUARTERS">4 Quarters (Pro Standard)</option>
                    <option value="SINGLE">1 Single Period</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Period Duration
                    </label>
                    <span className="text-[11px] font-mono font-bold text-white">
                      {Math.floor(autoFixtureForm.quarterDuration / 60)}:00 Mins
                    </span>
                  </div>
                  <select
                    value={autoFixtureForm.quarterDuration}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, quarterDuration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value={300}>5 Minutes</option>
                    <option value={480}>8 Minutes</option>
                    <option value={600}>10 Minutes</option>
                    <option value={720}>12 Minutes</option>
                    <option value={900}>15 Minutes</option>
                    <option value={1200}>20 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Shot Clock
                  </label>
                  <select
                    value={autoFixtureForm.shotClock}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, shotClock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value={24}>24 Seconds (FIBA / College)</option>
                    <option value={14}>14 Seconds</option>
                    <option value={12}>12 Seconds (3x3)</option>
                    <option value={0}>Disabled / OFF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={autoFixtureForm.startDate}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    First Match Time
                  </label>
                  <input
                    type="time"
                    required
                    value={autoFixtureForm.startTime}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Interval Between Matches
                  </label>
                  <select
                    value={autoFixtureForm.intervalMinutes}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, intervalMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={75}>75 Minutes</option>
                    <option value={90}>90 Minutes (1.5 Hours)</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Venue / Court
                  </label>
                  <input
                    type="text"
                    value={autoFixtureForm.venue}
                    onChange={(e) => setAutoFixtureForm({ ...autoFixtureForm, venue: e.target.value })}
                    placeholder="e.g. Main Court"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAutoFixtureModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingFixtures || tournamentTeams.length < 2}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all disabled:opacity-50"
                >
                  {generatingFixtures ? 'Generating Fixtures...' : '⚡ Generate Fixtures Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Match Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Reschedule Match</h3>
                <p className="text-xs text-slate-400 font-mono">Update date, timing, venue & period duration</p>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.scheduledDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Structure
                  </label>
                  <select
                    value={rescheduleForm.matchStructure}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        matchStructure: e.target.value,
                        quarterDuration: e.target.value === 'HALVES' ? 900 : 600,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="HALVES">2 Halves (College)</option>
                    <option value="QUARTERS">4 Quarters</option>
                    <option value="SINGLE">1 Single Period</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Period Duration
                    </label>
                    <span className="text-[11px] font-mono font-bold text-white">
                      {Math.floor(rescheduleForm.quarterDuration / 60)}:00 Mins
                    </span>
                  </div>
                  <select
                    value={rescheduleForm.quarterDuration}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, quarterDuration: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value={300}>5 Minutes</option>
                    <option value={480}>8 Minutes</option>
                    <option value={600}>10 Minutes</option>
                    <option value={720}>12 Minutes</option>
                    <option value={900}>15 Minutes</option>
                    <option value={1200}>20 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Shot Clock
                </label>
                <select
                  value={rescheduleForm.shotClock}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, shotClock: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value={24}>24 Seconds (FIBA / College)</option>
                  <option value={14}>14 Seconds</option>
                  <option value={12}>12 Seconds (3x3)</option>
                  <option value={0}>Disabled / OFF</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reschedulingMatch}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
                >
                  {reschedulingMatch ? 'Saving Schedule...' : 'Update Schedule'}
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

export default TournamentDetailsPage;
