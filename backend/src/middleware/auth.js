const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { recordAuthTime } = require('./performanceTracker');

const protect = async (req, res, next) => {
  const authStart = process.hrtime.bigint();
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hoopscore_super_secret_jwt_key_2026_basketball_3x3'
    );

    const user = await User.findById(decoded.id)
      .select('_id name email role tokenVersion isSuspended')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Please contact the Super Administrator.',
      });
    }

    // Session revocation check via tokenVersion
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired or been revoked. Please log in again.',
      });
    }

    req.user = user;
    const authElapsedMs = Number(process.hrtime.bigint() - authStart) / 1e6;
    recordAuthTime(authElapsedMs);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token.',
    });
  }
};

module.exports = { protect };
