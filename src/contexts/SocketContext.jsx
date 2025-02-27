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
    
    // Check if we already have a socket connection
    if (socketRef.current && socketRef.current.connected) {
      log('Socket already connected, reusing existing connection', { socketId: socketRef.current.id });
      setSocket(socketRef.current);
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
      
      // Re-join all active rooms/conversations after reconnect
      if (window.activeConversations) {
        window.activeConversations.forEach(id => {
          log(`Rejoining conversation ${id} after reconnect`);
          newSocket.emit('join_conversation', id);
        });
      }
    });
  
    newSocket.on('connect_error', (error) => {
      log('Socket connection error', error);
      // Try to reconnect after a short delay
      setTimeout(() => {
        log('Attempting to reconnect socket...');
        if (newSocket) newSocket.connect();
      }, 3000);
    });
    
    newSocket.on('disconnect', (reason) => {
      log('Socket disconnected', { reason });
      // If the disconnection was not intentional, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        log('Attempting to reconnect socket after disconnect...');
        setTimeout(() => {
          if (newSocket) newSocket.connect();
        }, 3000);
      }
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      log('Socket reconnected after', { attemptNumber });
      
      // Reregister user after reconnect
      if (user && user.id) {
        newSocket.emit('user_connected', user.id);
      }
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      log('Socket reconnection attempt', { attemptNumber });
    });
    
    newSocket.on('reconnect_error', (error) => {
      log('Socket reconnection error', error);
    });
    
    newSocket.on('reconnect_failed', () => {
      log('Socket reconnection failed after attempts');
      // Create a new socket instance as a last resort
      setTimeout(() => {
        log('Creating new socket instance after failed reconnections');
        setSocket(null);
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      }, 5000);
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
      
      // Add helper function to test connection
      window.testSocketConnection = () => {
        if (socketRef.current) {
          log('Testing socket connection...');
          socketRef.current.emit('ping');
        } else {
          log('No socket connection to test');
        }
      };
    }
  
    return () => {
      log('Cleaning up socket connection');
      if (socketRef.current) {
        // Properly disconnect
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      if (DEBUG && window) {
        if (window.debugSocket) delete window.debugSocket;
        if (window.testSocketConnection) delete window.testSocketConnection;
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