const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { connectDB } = require('./config/db');
const { initMatchSocket } = require('./sockets/matchSocket');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();
const server = http.createServer(app);

const path = require('path');
const fs = require('fs');

// Configure Socket.IO
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const corsOriginHandler = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.includes('vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.includes('onrender.com') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Pass Socket.IO instance to Express app
app.set('io', io);

// Initialize match socket room handlers
initMatchSocket(io);

// Core Middleware
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
const mongoose = require('mongoose');
const healthResponse = (req, res) => {
  const host = mongoose.connection.host || '';
  const isAtlas = host.includes('mongodb.net');
  res.status(200).json({
    status: 'ok',
    app: 'HoopScore 3x3 API',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: {
      connected: mongoose.connection.readyState === 1,
      type: isAtlas ? 'MongoDB Atlas (Cloud Permanent)' : (host.includes('127.0.0.1') ? 'Embedded In-Memory Fallback' : host),
      host: isAtlas ? host : (host.includes('127.0.0.1') ? 'Internal Memory Instance' : host),
    },
  });
};
app.get('/api/health', healthResponse);
app.get('/health', healthResponse);

// Mount Routes (Both /api prefix and direct paths for universal compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);

app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);
app.use('/players', playerRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/matches', matchRoutes);

// Serve static frontend build when dist directory exists
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/teams') ||
      req.path.startsWith('/players') ||
      req.path.startsWith('/tournaments') ||
      req.path.startsWith('/matches') ||
      req.path.startsWith('/socket.io')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🏀 HoopScore Server is running on port ${PORT}`);
      console.log(`📡 Socket.IO Real-time Engine Ready`);
      console.log(`🚀 Client URL: ${clientUrl}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
