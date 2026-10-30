const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getPerformanceAnalytics,
  recordClientVital,
  clearPerformanceStats,
} = require('../middleware/performanceTracker');

// @desc    Get comprehensive backend & frontend performance metrics (Admin only)
// @route   GET /api/performance/stats
// @access  Private (Admin / Super Admin)
router.get('/stats', protect, authorize('admin'), (req, res) => {
  try {
    const data = getPerformanceAnalytics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Report client-side Web Vitals from frontend
// @route   POST /api/performance/vitals
// @access  Public
router.post('/vitals', (req, res) => {
  try {
    const { name, value, rating, path } = req.body;
    if (name && typeof value === 'number') {
      recordClientVital({
        name: String(name).slice(0, 10).toUpperCase(),
        value: Number(value),
        rating: rating || 'good',
        path: path ? String(path).slice(0, 100) : '/',
      });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false }); // Non-blocking
  }
});

// @desc    Reset performance ring buffer metrics
// @route   POST /api/performance/reset
// @access  Private (Super Admin only)
router.post('/reset', protect, authorize('admin'), (req, res) => {
  try {
    clearPerformanceStats();
    res.status(200).json({ success: true, message: 'Performance metrics reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
