import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create a debug logger
const DEBUG = true;
const log = (message, data) => {
  if (DEBUG) {
    console.log(`[SOCKET SYSTEM] ${message}`, data || '');
  }
};

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      log('No user or token, not connecting socket');
      return;
    }
  
    log('Initializing socket connection', { userId: user.id });
    const newSocket = io('http://localhost:5000', {
      autoConnect: false,
      auth: { token },
      transports: ['polling', 'websocket'],
      // Try using these additional options
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    // Add more detailed event handlers for debugging
    newSocket.on('connect', () => {
      log('Socket connected successfully', { socketId: newSocket.id });
      newSocket.emit('user_connected', user.id);
    });
  
    newSocket.on('connect_error', (error) => {
      log('Socket connection error', error);
    });
    
    newSocket.on('disconnect', (reason) => {
      log('Socket disconnected', { reason });
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      log('Socket reconnected after', { attemptNumber });
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      log('Socket reconnection attempt', { attemptNumber });
    });
    
    newSocket.on('reconnect_error', (error) => {
      log('Socket reconnection error', error);
    });
    
    newSocket.on('reconnect_failed', () => {
      log('Socket reconnection failed after attempts');
    });
  
    // Connect the socket
    log('Connecting socket...');
    newSocket.connect();
    setSocket(newSocket);
    
    // Add socket to window for debugging
    if (DEBUG && window) {
      window.debugSocket = newSocket;
      log('Socket exposed as window.debugSocket');
    }
  
    return () => {
      log('Cleaning up socket connection');
      newSocket.close();
      if (DEBUG && window && window.debugSocket) {
        delete window.debugSocket;
      }
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);