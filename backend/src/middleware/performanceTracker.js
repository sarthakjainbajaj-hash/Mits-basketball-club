const { AsyncLocalStorage } = require('async_hooks');
const mongoose = require('mongoose');

// Request-scoped storage to measure per-request DB and middleware latencies concurrently
const requestContext = new AsyncLocalStorage();

// Circular Ring Buffer for bounded in-memory performance logs (prevents memory leaks)
const MAX_LOG_ENTRIES = 1000;
const requestHistory = [];
let requestCounter = 0;

// Global running metrics
const globalStats = {
  totalRequests: 0,
  status2xx: 0,
  status3xx: 0,
  status4xx: 0,
  status5xx: 0,
  totalResponseTimeMs: 0,
  totalDbTimeMs: 0,
  totalDbQueries: 0,
  minResponseTimeMs: Infinity,
  maxResponseTimeMs: 0,
  startedAt: Date.now(),
};

// Client-reported Core Web Vitals storage (bounded)
const clientVitals = [];
const MAX_VITALS_ENTRIES = 200;

// Helper to record DB execution time into active request context and global stats
const recordDbTime = (durationMs) => {
  const store = requestContext.getStore();
  if (store) {
    store.dbTimeMs = (store.dbTimeMs || 0) + durationMs;
    store.dbQueryCount = (store.dbQueryCount || 0) + 1;
  }
  globalStats.totalDbTimeMs += durationMs;
  globalStats.totalDbQueries += 1;
};

// Install Mongoose plugin to automatically measure database execution time for every query
let mongoosePluginInstalled = false;
const installMongoosePerformancePlugin = () => {
  if (mongoosePluginInstalled) return;
  mongoosePluginInstalled = true;

  mongoose.plugin(function (schema) {
    const queryOps = [
      'find',
      'findOne',
      'findOneAndUpdate',
      'findOneAndDelete',
      'updateOne',
      'updateMany',
      'deleteOne',
      'deleteMany',
      'countDocuments',
      'aggregate',
    ];

    queryOps.forEach((op) => {
      schema.pre(op, function () {
        this._queryStartTime = process.hrtime.bigint();
      });
      schema.post(op, function () {
        if (this._queryStartTime) {
          const elapsedMs = Number(process.hrtime.bigint() - this._queryStartTime) / 1e6;
          recordDbTime(elapsedMs);
        }
      });
    });

    schema.pre('save', function () {
      this._saveStartTime = process.hrtime.bigint();
    });
    schema.post('save', function () {
      if (this._saveStartTime) {
        const elapsedMs = Number(process.hrtime.bigint() - this._saveStartTime) / 1e6;
        recordDbTime(elapsedMs);
      }
    });
  });
};

// Request Performance Middleware
const performanceMiddleware = (req, res, next) => {
  // Skip tracking for static bundle assets
  if (
    req.path.startsWith('/assets/') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.ico')
  ) {
    return next();
  }

  const startHrTime = process.hrtime.bigint();
  const requestId = ++requestCounter;

  const store = {
    requestId,
    startTime: startHrTime,
    method: req.method,
    path: req.originalUrl || req.url,
    dbTimeMs: 0,
    dbQueryCount: 0,
    authTimeMs: 0,
  };

  requestContext.run(store, () => {
    // Intercept response finish
    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startHrTime;
      const durationMs = Math.round((Number(durationNs) / 1e6) * 100) / 100;
      const dbDurationMs = Math.round(store.dbTimeMs * 100) / 100;
      const statusCode = res.statusCode;

      // Update running aggregates
      globalStats.totalRequests += 1;
      globalStats.totalResponseTimeMs += durationMs;
      if (durationMs < globalStats.minResponseTimeMs) globalStats.minResponseTimeMs = durationMs;
      if (durationMs > globalStats.maxResponseTimeMs) globalStats.maxResponseTimeMs = durationMs;

      if (statusCode >= 200 && statusCode < 300) globalStats.status2xx += 1;
      else if (statusCode >= 300 && statusCode < 400) globalStats.status3xx += 1;
      else if (statusCode >= 400 && statusCode < 500) globalStats.status4xx += 1;
      else if (statusCode >= 500) globalStats.status5xx += 1;

      // Clean, parameterized route normalization
      const cleanPath = (req.originalUrl || req.url).split('?')[0];

      // Add to ring buffer
      const entry = {
        id: requestId,
        method: req.method,
        path: cleanPath,
        statusCode,
        durationMs,
        dbTimeMs: dbDurationMs,
        dbQueryCount: store.dbQueryCount,
        authTimeMs: Math.round(store.authTimeMs * 100) / 100,
        timestamp: Date.now(),
      };

      if (requestHistory.length >= MAX_LOG_ENTRIES) {
        requestHistory.shift();
      }
      requestHistory.push(entry);

      // Structured server log for non-200 responses or slow requests (> 150ms)
      if (statusCode >= 400 || durationMs > 150) {
        const flag = statusCode >= 500 ? '🚨 [API ERR]' : durationMs > 150 ? '⏱️ [SLOW API]' : '⚠️ [CLIENT ERR]';
        console.log(
          `${flag} ${req.method} ${cleanPath} | Status: ${statusCode} | Time: ${durationMs}ms | DB: ${dbDurationMs}ms (${store.dbQueryCount} queries)`
        );
      }
    });

    next();
  });
};

// Helper for auth middleware to record auth check duration
const recordAuthTime = (durationMs) => {
  const store = requestContext.getStore();
  if (store) {
    store.authTimeMs = (store.authTimeMs || 0) + durationMs;
  }
};

// Calculate Percentiles (P50, P90, P95, P99)
const calculatePercentiles = (durations) => {
  if (durations.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0 };
  const sorted = [...durations].sort((a, b) => a - b);
  const getPercentile = (p) => {
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  };

  return {
    p50: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
  };
};

// Record Client-Side Core Web Vitals (sent by frontend reportClientVital API)
const recordClientVital = (vital) => {
  if (!vital || !vital.name) return;
  if (clientVitals.length >= MAX_VITALS_ENTRIES) {
    clientVitals.shift();
  }
  clientVitals.push({
    ...vital,
    timestamp: Date.now(),
  });
};

// Aggregate and return full performance analytics for Admin Dashboard
const getPerformanceAnalytics = () => {
  const totalReqs = globalStats.totalRequests;
  const avgResponseTimeMs =
    totalReqs > 0 ? Math.round((globalStats.totalResponseTimeMs / totalReqs) * 10) / 10 : 0;
  const avgDbTimeMs =
    globalStats.totalDbQueries > 0
      ? Math.round((globalStats.totalDbTimeMs / globalStats.totalDbQueries) * 10) / 10
      : 0;

  // Extract all response durations from recent history for percentile calculation
  const recentDurations = requestHistory.map((r) => r.durationMs);
  const percentiles = calculatePercentiles(recentDurations);

  // Group by Endpoint
  const endpointMap = {};
  for (const item of requestHistory) {
    const key = `${item.method} ${item.path}`;
    if (!endpointMap[key]) {
      endpointMap[key] = {
        endpoint: key,
        method: item.method,
        path: item.path,
        count: 0,
        errors: 0,
        totalDuration: 0,
        totalDbTime: 0,
        maxDuration: 0,
        minDuration: Infinity,
      };
    }
    const e = endpointMap[key];
    e.count += 1;
    e.totalDuration += item.durationMs;
    e.totalDbTime += item.dbTimeMs;
    if (item.durationMs > e.maxDuration) e.maxDuration = item.durationMs;
    if (item.durationMs < e.minDuration) e.minDuration = item.durationMs;
    if (item.statusCode >= 400) e.errors += 1;
  }

  // Format Endpoint Statistics
  const endpointStats = Object.values(endpointMap).map((e) => ({
    endpoint: e.endpoint,
    method: e.method,
    path: e.path,
    calls: e.count,
    errors: e.errors,
    errorRate: Math.round((e.errors / e.count) * 1000) / 10,
    avgLatencyMs: Math.round((e.totalDuration / e.count) * 10) / 10,
    avgDbTimeMs: Math.round((e.totalDbTime / e.count) * 10) / 10,
    maxLatencyMs: Math.round(e.maxDuration * 10) / 10,
    minLatencyMs: e.minDuration === Infinity ? 0 : Math.round(e.minDuration * 10) / 10,
  }));

  // Top Slowest Endpoints (ranked by average latency)
  const slowestEndpoints = [...endpointStats]
    .sort((a, b) => b.avgLatencyMs - a.avgLatencyMs)
    .slice(0, 10);

  // Most Frequently Called Endpoints
  const mostCalledEndpoints = [...endpointStats]
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  // Recent Slow Requests (> 100ms)
  const recentSlowRequests = requestHistory
    .filter((r) => r.durationMs > 100)
    .slice(-30)
    .reverse();

  // Core Web Vitals Summary
  const vitalsSummary = {
    LCP: null,
    INP: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  };

  const vitalTypes = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
  vitalTypes.forEach((vType) => {
    const matches = clientVitals.filter((v) => v.name === vType).map((v) => v.value);
    if (matches.length > 0) {
      const avg = matches.reduce((sum, val) => sum + val, 0) / matches.length;
      vitalsSummary[vType] = Math.round(avg * 100) / 100;
    }
  });

  // System & Connection Status
  const memoryUsage = process.memoryUsage();
  const dbConnected = mongoose.connection.readyState === 1;

  return {
    overview: {
      totalRequests: globalStats.totalRequests,
      avgResponseTimeMs,
      minResponseTimeMs:
        globalStats.minResponseTimeMs === Infinity ? 0 : globalStats.minResponseTimeMs,
      maxResponseTimeMs: globalStats.maxResponseTimeMs,
      percentiles,
      avgDbTimeMs,
      totalDbQueries: globalStats.totalDbQueries,
      uptimeSeconds: Math.floor((Date.now() - globalStats.startedAt) / 1000),
    },
    statusCodes: {
      '2xx': globalStats.status2xx,
      '3xx': globalStats.status3xx,
      '4xx': globalStats.status4xx,
      '5xx': globalStats.status5xx,
      totalErrors: globalStats.status4xx + globalStats.status5xx,
      successRate:
        totalReqs > 0
          ? Math.round((globalStats.status2xx / totalReqs) * 1000) / 10
          : 100,
    },
    slowestEndpoints,
    mostCalledEndpoints,
    recentSlowRequests,
    recentRequests: requestHistory.slice(-50).reverse(),
    coreWebVitals: vitalsSummary,
    recentClientVitals: clientVitals.slice(-30).reverse(),
    system: {
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 10) / 10,
      heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 10) / 10,
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 10) / 10,
      nodeVersion: process.version,
      database: {
        connected: dbConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || 'Unknown',
        name: mongoose.connection.name || 'hoopscore',
      },
    },
  };
};

const clearPerformanceStats = () => {
  requestHistory.length = 0;
  clientVitals.length = 0;
  globalStats.totalRequests = 0;
  globalStats.status2xx = 0;
  globalStats.status3xx = 0;
  globalStats.status4xx = 0;
  globalStats.status5xx = 0;
  globalStats.totalResponseTimeMs = 0;
  globalStats.totalDbTimeMs = 0;
  globalStats.totalDbQueries = 0;
  globalStats.minResponseTimeMs = Infinity;
  globalStats.maxResponseTimeMs = 0;
  globalStats.startedAt = Date.now();
};

module.exports = {
  performanceMiddleware,
  installMongoosePerformancePlugin,
  recordAuthTime,
  recordClientVital,
  getPerformanceAnalytics,
  clearPerformanceStats,
};
