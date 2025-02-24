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
  const [unreadMessages, setUnreadMessages] = useState(0);
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
      unreadMessages,
      friendRequests
    });
  }, [user, token, socket, unreadMessages, friendRequests]);

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
  
  const fetchUnreadMessages = async () => {
    if (!token) return;
    
    try {
      console.log('Fetching unread messages count...');
      const response = await axios.get(
        'http://localhost:5000/api/messages/unread',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('Unread messages count response:', response.data);
      // Ensure we always set a number value, defaulting to 0 if count is missing
      const count = response.data?.count ?? 0;
      setUnreadMessages(count);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      // Don't change state on error
    }
  };

  // Manual function to directly increment the unread messages count
  const incrementUnreadMessages = () => {
    log('Manually incrementing unread messages count');
    setUnreadMessages(prev => {
      const newCount = prev + 1;
      log('New unread count', newCount);
      return newCount;
    });
  };

  // Socket connection listener - monitor socket connection status
  useEffect(() => {
    log('Socket connection status changed', !!socket);
    
    // Expose a global debug function
    if (DEBUG && window) {
      window.debugNotifications = {
        getState: () => ({
          friendRequests,
          unreadMessages,
          user: userRef.current,
          socketConnected: !!socketRef.current,
          hasToken: !!tokenRef.current
        }),
        fetchUnreadMessages,
        incrementUnreadMessages,
        forceRefresh: () => {
          fetchFriendRequests();
          fetchUnreadMessages();
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
      fetchUnreadMessages();
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
    
    log('Setting up socket event listeners', { userId: user.id });
    
    // Direct message handler
    const handleNewMessage = (message) => {
      log('Socket: receive_message event received', message);
      
      // Check if this message is for the current user and not from them
      if (message.receiver_id === user.id && message.sender_id !== user.id) {
        log('Message is for current user - updating notification count');
        incrementUnreadMessages();
      } else {
        log('Message is not for current user or is from current user - ignoring');
      }
    };
    
    // Friend request handler
    const handleFriendRequest = () => {
      log('Socket: new_friend_request event received');
      fetchFriendRequests();
    };
    
    // Socket connection handlers
    const handleConnect = () => {
      log('Socket connected');
    };
    
    const handleDisconnect = () => {
      log('Socket disconnected');
    };
    
    const handleConnectError = (err) => {
      log('Socket connection error', err);
    };
    
    // Register all event listeners
    socket.on('receive_message', handleNewMessage);
    socket.on('new_friend_request', handleFriendRequest);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    
    // Also try listening for a direct 'new_message' event that might be emitted
    socket.on('new_message', (data) => {
      log('Socket: new_message event received', data);
      fetchUnreadMessages();
    });
    
    // Clean up all listeners
    return () => {
      log('Cleaning up socket listeners');
      socket.off('receive_message', handleNewMessage);
      socket.off('new_friend_request', handleFriendRequest);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new_message');
    };
  }, [socket, user]);

  const clearFriendRequests = () => {
    log('Clearing friend requests notifications');
    setFriendRequests(0);
  };

  const clearMessageNotifications = () => {
    log('Clearing message notifications');
    setUnreadMessages(0);
  };

  const contextValue = {
    friendRequests, 
    unreadMessages,
    clearFriendRequests, 
    clearMessageNotifications,
    fetchUnreadMessages,
    // Add the direct increment function for debugging
    _debug_incrementUnreadMessages: DEBUG ? incrementUnreadMessages : undefined
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);