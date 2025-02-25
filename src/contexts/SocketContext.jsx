import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const socketRef = useRef(null); // Keep a ref to the socket instance

  useEffect(() => {
    if (!user || !token) {
      log('No user or token, not connecting socket');
      return;
    }
  
    log('Initializing socket connection', { userId: user.id });
    const newSocket = io('http://localhost:5000', {
      autoConnect: true, // Changed to true
      auth: { token },
      transports: ['websocket', 'polling'], // Put websocket first
      reconnection: true,
      reconnectionAttempts: 10, // Increased attempts
      reconnectionDelay: 1000,
      timeout: 10000 // Add timeout option
    });
  
    // Store in ref immediately
    socketRef.current = newSocket;
    
    // Add more detailed event handlers for debugging
    newSocket.on('connect', () => {
      log('Socket connected successfully', { socketId: newSocket.id });
      
      // Important: Only set the socket in state AFTER connection
      setSocket(newSocket);
      
      // Register user after connection
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
    
    // Debug listener for all events
    if (DEBUG) {
      const originalOnevent = newSocket.onevent;
      newSocket.onevent = function(packet) {
        const args = packet.data || [];
        log('EVENT RECEIVED', { event: args[0], data: args[1] });
        originalOnevent.call(this, packet);
      };
    }
  
    // Add socket to window for debugging
    if (DEBUG && window) {
      window.debugSocket = newSocket;
      log('Socket exposed as window.debugSocket');
    }
  
    return () => {
      log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setSocket(null);
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