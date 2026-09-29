import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Resolve normalized Socket Server URL:
// 1. If VITE_SOCKET_URL is set, use it.
// 2. Otherwise derive from VITE_API_URL by stripping /api and trailing slash.
// 3. Fallback: on non-localhost (Vercel production), connect to Render backend.
// 4. On localhost, connect to http://localhost:5000.
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.trim().replace(/\/+$/, '');
  }

  if (import.meta.env.VITE_API_URL) {
    let api = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    if (api.endsWith('/api')) {
      api = api.slice(0, -4);
    }
    return api;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost) {
      return 'https://mits-basketball-club.onrender.com';
    }
  }

  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('[Socket] Connected to server, ID:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      // console.log('[Socket] Disconnected from server:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      // console.warn('[Socket] Connection error:', err.message);
      setIsConnected(false);
      setConnectionError(err.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinMatch = (matchId) => {
    if (socketRef.current && matchId) {
      socketRef.current.emit('join-match', matchId);
    }
  };

  const leaveMatch = (matchId) => {
    if (socketRef.current && matchId) {
      socketRef.current.emit('leave-match', matchId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connectionError,
        joinMatch,
        leaveMatch,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
