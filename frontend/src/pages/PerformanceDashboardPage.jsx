import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { performanceApi } from '../api/performanceApi';
import { clientLatencyLogs } from '../api/axiosClient';
import {
  Activity,
  Zap,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Layers,
  Gauge,
  Sliders,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const PerformanceDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'slowest' | 'frequent' | 'stream' | 'vitals'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchMetrics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await performanceApi.getStats();
      if (res?.data) {
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load performance metrics');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Periodic Auto-refresh (every 6s when autoRefresh is enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  const handleReset = async () => {
    if (!window.confirm('Reset all in-memory performance statistics and request buffers?')) return;
    try {
      setResetting(true);
      await performanceApi.resetStats();
      await fetchMetrics();
    } catch (err) {
      alert('Failed to reset: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const getLatencyBadgeClass = (ms) => {
    if (ms <= 50) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
    if (ms <= 150) return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
    return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
  };

  const getStatusBadge = (code) => {
    if (code >= 200 && code < 300) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
          {code} OK
        </span>
      );
    }
    if (code >= 400 && code < 500) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
          {code} CLIENT
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">
        {code} ERR
      </span>
    );
  };

  const getVitalBadge = (name, value) => {
    if (value === null || value === undefined) return <span className="text-slate-500 font-mono text-xs">N/A</span>;
    let isGood = false;
    let unit = 'ms';

    if (name === 'LCP') {
      isGood = value <= 2500;
    } else if (name === 'CLS') {
      isGood = value <= 0.1;
      unit = '';
    } else if (name === 'INP' || name === 'FCP') {
      isGood = value <= 200;
    } else if (name === 'TTFB') {
      isGood = value <= 800;
    }

    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
          isGood
            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
            : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
        }`}
      >
        {value}
        {unit} {isGood ? '✓ Optimal' : '⚠️ Moderate'}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-400 text-sm">
          Performance Monitoring is reserved for authorized platform administrators and engineers.
        </p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const statusCodes = data?.statusCodes || {};
  const percentiles = overview.percentiles || { p50: 0, p90: 0, p95: 0, p99: 0 };
  const vitals = data?.coreWebVitals || {};
  const system = data?.system || {};

  // Filtered requests list
  const filteredRequests = (data?.recentRequests || []).filter((r) => {
    if (statusFilter === '2xx' && (r.statusCode < 200 || r.statusCode >= 300)) return false;
    if (statusFilter === '4xx' && (r.statusCode < 400 || r.statusCode >= 500)) return false;
    if (statusFilter === '5xx' && r.statusCode < 500) return false;
    if (statusFilter === 'slow' && r.durationMs <= 100) return false;
    if (searchFilter && !r.path.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30">
              AUDIT & TELEMETRY
            </span>
            <span className="text-xs font-mono text-slate-400">HoopScore v2.0 Production Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-orange-500" />
            Performance & Latency Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time request tracing, MongoDB Atlas query timings, P95/P99 latency & Core Web Vitals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Refresh Switch */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
              autoRefresh
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Auto-refresh every 6 seconds"
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
            />
            <span>{autoRefresh ? 'LIVE (6s)' : 'PAUSED'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchMetrics(false)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Reset Stats */}
          {user?.role === 'superadmin' && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
              title="Reset metric buffers"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: API Response Time */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-orange-400" /> Avg API Latency
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">{overview.totalRequests || 0} reqs</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {overview.avgResponseTimeMs || 0}
              <span className="text-base text-orange-400 font-semibold ml-1">ms</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getLatencyBadgeClass(
                overview.avgResponseTimeMs || 0
              )}`}
            >
              {overview.avgResponseTimeMs <= 100 ? 'Target Achieved' : 'Normal'}
            </span>
          </div>
          {/* Latency percentiles mini bar */}
          <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-center">
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/60">
              <div className="text-slate-500 font-bold">P50</div>
              <div className="text-slate-200 font-semibold">{percentiles.p50}ms</div>
            </div>
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/60">
              <div className="text-slate-500 font-bold">P90</div>
              <div className="text-slate-200 font-semibold">{percentiles.p90}ms</div>
            </div>
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/60">
              <div className="text-slate-500 font-bold">P95</div>
              <div className="text-amber-300 font-semibold">{percentiles.p95}ms</div>
            </div>
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/60">
              <div className="text-slate-500 font-bold">P99</div>
              <div className="text-rose-400 font-semibold">{percentiles.p99}ms</div>
            </div>
          </div>
        </div>

        {/* Card 2: MongoDB Atlas DB Time */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Database className="w-4 h-4 text-cyan-400" /> Database Execution
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">{overview.totalDbQueries || 0} queries</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {overview.avgDbTimeMs || 0}
              <span className="text-base text-cyan-400 font-semibold ml-1">ms</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getLatencyBadgeClass(
                overview.avgDbTimeMs || 0
              )}`}
            >
              {overview.avgDbTimeMs <= 50 ? 'Optimal <50ms' : 'Indexed'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span>Pool Size: 30 sockets</span>
            <span className="text-emerald-400 font-bold">● Active & Reused</span>
          </div>
        </div>

        {/* Card 3: Success Rate & Errors */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-emerald-400" /> API Reliability
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              {statusCodes.totalErrors || 0} errors
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {statusCodes.successRate !== undefined ? statusCodes.successRate : 100}
              <span className="text-base text-emerald-400 font-semibold ml-0.5">%</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              {statusCodes['2xx'] || 0} Success
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Client (4xx):</span>
              <span className="text-amber-400 font-bold">{statusCodes['4xx'] || 0}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Server (5xx):</span>
              <span className="text-rose-400 font-bold">{statusCodes['5xx'] || 0}</span>
            </div>
          </div>
        </div>

        {/* Card 4: System Memory & Runtime */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Server className="w-4 h-4 text-indigo-400" /> Backend Memory & Uptime
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Node {system.nodeVersion || 'v20'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {system.heapUsedMb || 0}
              <span className="text-base text-indigo-400 font-semibold ml-1">MB</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
              RSS: {system.rssMb || 0} MB
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span>Uptime: {Math.floor((overview.uptimeSeconds || 0) / 60)}m {((overview.uptimeSeconds || 0) % 60)}s</span>
            <span className="text-slate-300 truncate max-w-[130px]">{system.database?.host || 'Connected'}</span>
          </div>
        </div>
      </div>

      {/* Core Web Vitals Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Real Frontend Core Web Vitals (Real User Metrics)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Captured natively via PerformanceObserver</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">LCP (Load Time)</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {vitals.LCP ? `${vitals.LCP} ms` : 'Collecting...'}
            </div>
            <div>{getVitalBadge('LCP', vitals.LCP)}</div>
            <div className="text-[10px] text-slate-500 font-mono">Target: &lt;2.5s</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">INP (Responsiveness)</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {vitals.INP ? `${vitals.INP} ms` : 'Collecting...'}
            </div>
            <div>{getVitalBadge('INP', vitals.INP)}</div>
            <div className="text-[10px] text-slate-500 font-mono">Target: &lt;200ms</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">CLS (Visual Stability)</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {vitals.CLS !== null && vitals.CLS !== undefined ? vitals.CLS : 'Collecting...'}
            </div>
            <div>{getVitalBadge('CLS', vitals.CLS)}</div>
            <div className="text-[10px] text-slate-500 font-mono">Target: &lt;0.10</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">FCP (First Paint)</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {vitals.FCP ? `${vitals.FCP} ms` : 'Collecting...'}
            </div>
            <div>{getVitalBadge('FCP', vitals.FCP)}</div>
            <div className="text-[10px] text-slate-500 font-mono">Target: &lt;1.8s</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">TTFB (Server Byte)</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {vitals.TTFB ? `${vitals.TTFB} ms` : 'Collecting...'}
            </div>
            <div>{getVitalBadge('TTFB', vitals.TTFB)}</div>
            <div className="text-[10px] text-slate-500 font-mono">Target: &lt;800ms</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Slowest Endpoints', icon: TrendingDown },
          { id: 'frequent', label: 'Top Traffic Endpoints', icon: TrendingUp },
          { id: 'stream', label: 'Live Request Trace', icon: Activity },
          { id: 'client', label: 'Client Latencies', icon: Gauge },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Slowest Endpoints Table */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Slowest API Endpoints (Ranked by Average Response Time)</h3>
            <span className="text-xs font-mono text-slate-400">Top 10 highest execution times</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <th className="py-3 px-4">Method & Endpoint</th>
                  <th className="py-3 px-4">Avg Total Time</th>
                  <th className="py-3 px-4">Avg DB Time</th>
                  <th className="py-3 px-4">Max Peak Time</th>
                  <th className="py-3 px-4">Calls</th>
                  <th className="py-3 px-4">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(data?.slowestEndpoints || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No request traces captured yet. Send requests to populate telemetry.
                    </td>
                  </tr>
                ) : (
                  data.slowestEndpoints.map((ep, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ep.method === 'GET'
                              ? 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                              : ep.method === 'POST'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-semibold text-slate-200">{ep.path}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold border ${getLatencyBadgeClass(ep.avgLatencyMs)}`}>
                          {ep.avgLatencyMs} ms
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{ep.avgDbTimeMs} ms</td>
                      <td className="py-3 px-4 text-slate-300">{ep.maxLatencyMs} ms</td>
                      <td className="py-3 px-4 text-slate-400 font-bold">{ep.calls}</td>
                      <td className="py-3 px-4">
                        <span className={ep.errorRate > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {ep.errorRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Top Traffic Endpoints */}
      {activeTab === 'frequent' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Most Frequently Hit API Routes</h3>
            <span className="text-xs font-mono text-slate-400">Ranked by total invocations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Total Hits</th>
                  <th className="py-3 px-4">Avg Latency</th>
                  <th className="py-3 px-4">DB Latency</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(data?.mostCalledEndpoints || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No traffic registered yet.
                    </td>
                  </tr>
                ) : (
                  data.mostCalledEndpoints.map((ep, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {ep.method}
                        </span>
                        <span className="font-semibold text-slate-200">{ep.path}</span>
                      </td>
                      <td className="py-3 px-4 text-orange-400 font-bold text-sm">{ep.calls}</td>
                      <td className="py-3 px-4">{ep.avgLatencyMs} ms</td>
                      <td className="py-3 px-4 text-cyan-400">{ep.avgDbTimeMs} ms</td>
                      <td className="py-3 px-4">
                        <span className={ep.errorRate === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {ep.errorRate === 0 ? '100% Success' : `${100 - ep.errorRate}% Success`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Live Request Stream */}
      {activeTab === 'stream' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-white text-sm">Real-time HTTP Request Trace (Bounded Ring Buffer)</h3>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Filter path (e.g. /matches)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="2xx">2xx OK</option>
                <option value="4xx">4xx Client Errors</option>
                <option value="5xx">5xx Server Errors</option>
                <option value="slow">Slow Requests (&gt;100ms)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Method & Path</th>
                  <th className="py-2.5 px-3">Total Time</th>
                  <th className="py-2.5 px-3">DB Queries</th>
                  <th className="py-2.5 px-3">DB Time</th>
                  <th className="py-2.5 px-3">Auth Time</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-500">
                      No matching request logs found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.slice(0, 50).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3">{getStatusBadge(r.statusCode)}</td>
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span className="font-bold text-slate-400">{r.method}</span>
                        <span className="text-slate-200 truncate max-w-[280px]">{r.path}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold border ${getLatencyBadgeClass(r.durationMs)}`}>
                          {r.durationMs} ms
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{r.dbQueryCount}</td>
                      <td className="py-2 px-3 text-cyan-400">{r.dbTimeMs} ms</td>
                      <td className="py-2 px-3 text-slate-500">{r.authTimeMs > 0 ? `${r.authTimeMs}ms` : '-'}</td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Client Latencies */}
      {activeTab === 'client' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Client Roundtrip Latency (Browser &rarr; Server &rarr; Browser)</h3>
            <span className="text-xs font-mono text-slate-400">Measured directly via frontend Axios client</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Method & URL</th>
                  <th className="py-2.5 px-3">Client Roundtrip</th>
                  <th className="py-2.5 px-3">In-Memory Cache</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {clientLatencyLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500">
                      No client requests captured in this session yet.
                    </td>
                  </tr>
                ) : (
                  [...clientLatencyLogs].reverse().map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span className="font-bold text-slate-400">{log.method}</span>
                        <span className="text-slate-200">{log.url}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold border ${getLatencyBadgeClass(log.latencyMs)}`}>
                          {log.latencyMs} ms
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {log.cached ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                            ⚡ 0ms CACHE HIT
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">NETWORK ROUNDTRIP</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboardPage;
