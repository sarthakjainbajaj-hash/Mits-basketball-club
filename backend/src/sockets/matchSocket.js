const initMatchSocket = (io) => {
  io.on('connection', (socket) => {
    // console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a specific match room
    socket.on('join-match', (matchId) => {
      if (!matchId) return;
      const roomName = `match:${matchId}`;
      socket.join(roomName);
      // console.log(`[Socket] ${socket.id} joined room ${roomName}`);
      socket.emit('joined-match', { room: roomName, matchId });
    });

    // Leave a specific match room
    socket.on('leave-match', (matchId) => {
      if (!matchId) return;
      const roomName = `match:${matchId}`;
      socket.leave(roomName);
      // console.log(`[Socket] ${socket.id} left room ${roomName}`);
    });

    // Client ping / sync request
    socket.on('sync-match-request', (matchId) => {
      if (!matchId) return;
      // This is a heartbeat/sync check
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to broadcast match state updates to all clients in the match room
const broadcastMatchState = (io, matchId, match, latestEvent = null) => {
  if (!io || !matchId) return;
  const roomName = `match:${matchId}`;
  io.to(roomName).emit('match-updated', {
    match,
    latestEvent,
    timestamp: Date.now(),
  });
};

// Helper function to broadcast buzzer sounds / alerts
const broadcastBuzzerAlert = (io, matchId, buzzerType, details = {}) => {
  if (!io || !matchId) return;
  const roomName = `match:${matchId}`;
  io.to(roomName).emit('buzzer-alert', {
    type: buzzerType, // 'SHOT_CLOCK', 'GAME_END', 'WHISTLE'
    details,
    timestamp: Date.now(),
  });
};

module.exports = {
  initMatchSocket,
  broadcastMatchState,
  broadcastBuzzerAlert,
};
