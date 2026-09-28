import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
