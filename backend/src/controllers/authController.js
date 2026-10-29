const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET || 'hoopscore_super_secret_jwt_key_2026_basketball_3x3',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Default role: viewer ONLY)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // SECURITY: Always ignore client-supplied role or permissions.
    // Public registrations are granted viewer access only.
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'viewer',
      tokenVersion: 0,
      isSuspended: false,
      failedLoginAttempts: 0,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & get token with account lock protection
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to excessive failed attempts. Please try again in ${waitMinutes} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Reset failed login count upon successful password match
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Check suspension
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/auth/users
// @access  Private (Admin, Super Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role with strict hierarchical privilege validation
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin, Super Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();
    const currentUserRole = req.user.role;

    const validRoles = ['superadmin', 'admin', 'scorer', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // RULE 1: Self-promotion / self-role change protection
    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role. Another administrator must perform this action.',
      });
    }

    // RULE 2: Super Admin role modifications
    if (targetUser.role === 'superadmin' && currentUserRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Ordinary Admins cannot modify a Super Admin account.',
      });
    }

    // RULE 3: Admin role promotions
    if ((role === 'superadmin' || role === 'admin') && currentUserRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the Super Admin can grant Admin or Super Admin privileges.',
      });
    }

    // RULE 4: Admin cannot demote another Admin
    if (targetUser.role === 'admin' && currentUserRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the Super Admin can modify other Admin accounts.',
      });
    }

    // Apply role change and invalidate existing sessions immediately
    targetUser.role = role;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1; // Invalidate stale sessions
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to '${role}'. Active sessions invalidated.`,
      data: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke all active sessions for a user (Super Admin only)
// @route   POST /api/auth/users/:id/revoke-sessions
// @access  Private (Super Admin)
const revokeUserSessions = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `All active sessions for ${targetUser.name} have been revoked.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend or unsuspend a user account (Super Admin only)
// @route   PUT /api/auth/users/:id/suspend
// @access  Private (Super Admin)
const toggleUserSuspension = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own account' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend a Super Admin account' });
    }

    targetUser.isSuspended = !targetUser.isSuspended;
    if (targetUser.isSuspended) {
      targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1; // Terminate sessions upon suspension
    }
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `Account ${targetUser.isSuspended ? 'suspended' : 're-activated'} successfully.`,
      data: {
        _id: targetUser._id,
        isSuspended: targetUser.isSuspended,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
  revokeUserSessions,
  toggleUserSuspension,
};
