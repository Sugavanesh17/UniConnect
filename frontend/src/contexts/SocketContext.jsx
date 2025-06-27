import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      const socketInstance = io(SOCKET_URL, {
        auth: {
          userId: user._id,
          userName: user.name
        },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        console.log('Connected to server');
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from server');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user, SOCKET_URL]);

  const joinProject = (projectId) => {
    if (socket && connected) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && connected) {
      socket.emit('leave-project', projectId);
    }
  };

  const sendMessage = (projectId, message) => {
    if (socket && connected && user) {
      socket.emit('send-message', {
        projectId,
        message,
        userId: user._id,
        userName: user.name
      });
    }
  };

  const setTyping = (projectId, isTyping) => {
    if (socket && connected && user) {
      socket.emit('typing', {
        projectId,
        userId: user._id,
        userName: user.name,
        isTyping
      });
    }
  };

  const value = {
    socket,
    connected,
    joinProject,
    leaveProject,
    sendMessage,
    setTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};