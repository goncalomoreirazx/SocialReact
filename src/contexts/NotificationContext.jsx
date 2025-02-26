import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

// Create a debug logger
const DEBUG = true;
const log = (message, data) => {
  if (DEBUG) {
    console.log(`[NOTIFICATION SYSTEM] ${message}`, data || '');
  }
};

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [friendRequests, setFriendRequests] = useState(0);
  const { token, user } = useAuth();
  const socket = useSocket();
  
  // Use refs to track state for debugging
  const userRef = useRef(user);
  const tokenRef = useRef(token);
  const socketRef = useRef(socket);
  
  useEffect(() => {
    userRef.current = user;
    tokenRef.current = token;
    socketRef.current = socket;
    
    log('State updated', { 
      user: user?.id, 
      hasToken: !!token, 
      socketConnected: !!socket,
      friendRequests
    });
  }, [user, token, socket, friendRequests]);

  const fetchFriendRequests = async () => {
    if (!token) {
      log('Cannot fetch friend requests - no token');
      return;
    }
    
    try {
      log('Fetching friend requests');
      const response = await axios.get(
        'http://localhost:5000/api/friends/pending',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      log('Friend requests data received', response.data);
      setFriendRequests(response.data.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };
  
  // Socket connection listener - monitor socket connection status
  useEffect(() => {
    log('Socket reference changed', { connected: !!socket });
    
    // Expose a global debug function
    if (DEBUG && window) {
      window.debugNotifications = {
        getState: () => ({
          friendRequests,
          user: userRef.current,
          socketConnected: !!socketRef.current,
          hasToken: !!tokenRef.current
        }),
       
        forceRefresh: () => {
          fetchFriendRequests();
        }
      };
      
      log('Debug functions exposed as window.debugNotifications');
    }
    
    return () => {
      if (DEBUG && window && window.debugNotifications) {
        delete window.debugNotifications;
      }
    };
  }, [socket]);

  // Initial data load
  useEffect(() => {
    if (token) {
      log('Initial data load', { userId: user?.id });
      fetchFriendRequests();
    }
  }, [token, user]);

  // Socket event listeners for notifications
  useEffect(() => {
    if (!socket || !user) {
      log('Cannot set up socket listeners - missing socket or user', { 
        hasSocket: !!socket,
        hasUser: !!user
      });
      return;
    }
    
    log('Setting up socket event listeners', { userId: user.id, socketId: socket.id });
    
    // Friend request handler
    const handleNewFriendRequest = () => {
      log('Socket: new_friend_request event received');
      // Increment the friend request count directly
      setFriendRequests(prev => prev + 1);
      // Also fetch the full list to ensure we're in sync
      fetchFriendRequests();
    };
    
    // Register the event listener
    socket.on('new_friend_request', handleNewFriendRequest);
    
    // Clean up all listeners
    return () => {
      log('Cleaning up socket listeners');
      socket.off('new_friend_request', handleNewFriendRequest);
    };
  }, [socket, user]);

  const clearFriendRequests = () => {
    log('Clearing friend requests notifications');
    setFriendRequests(0);
  };

  const contextValue = {
    friendRequests, 
    clearFriendRequests, 
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);