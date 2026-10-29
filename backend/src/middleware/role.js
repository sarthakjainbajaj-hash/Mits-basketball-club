const Match = require('../models/Match');

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Super Admin inherits all authorized administrative capabilities
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this action. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

// Strict Super Admin only middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Super Administrator privilege required for this operation.',
    });
  }

  next();
};

// Strict Match Scorer Assignment & Authorization Middleware (Mitigates Scorer IDOR & Match Tampering)
const verifyMatchScorer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const matchId = req.params.id || req.body.matchId;
    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: 'Match ID is required for scorer authorization check',
      });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    // Super Admin and Admin can manage and score any match
    if (req.user.role === 'superadmin' || req.user.role === 'admin') {
      req.match = match;
      return next();
    }

    // Scorer must be explicitly assigned to this match
    if (req.user.role === 'scorer') {
      if (!match.assignedScorer) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No scorer is currently assigned to this match. Contact an administrator for assignment.',
        });
      }

      const assignedId = (match.assignedScorer._id || match.assignedScorer).toString();
      const currentUserId = req.user._id.toString();

      if (assignedId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not the assigned scorer for this match.',
        });
      }

      req.match = match;
      return next();
    }

    // Viewers or any other roles are strictly prohibited
    return res.status(403).json({
      success: false,
      message: `Access denied: Role '${req.user.role}' cannot modify match state.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying match scorer authorization: ' + error.message,
    });
  }
};

module.exports = {
  authorize,
  requireSuperAdmin,
  verifyMatchScorer,
};
