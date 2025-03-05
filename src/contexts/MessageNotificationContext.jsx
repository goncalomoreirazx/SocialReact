// src/contexts/MessageNotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create the context
const MessageNotificationContext = createContext();

export const MessageNotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  // Connect socket when component mounts
  useEffect(() => {
    if (!user || !token) return;
    
    console.log('MessageNotification: Creating socket connection');
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('MessageNotification: Socket connected');
      newSocket.emit('user_connected', user.id);
      setSocket(newSocket);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('MessageNotification: Socket connection error', error);
    });
    
    // Clean up on unmount
    return () => {
      console.log('MessageNotification: Cleaning up socket');
      if (newSocket) newSocket.disconnect();
    };
  }, [user, token]);
  
  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;
    
    const fetchUnreadCount = async () => {
      try {
        console.log('MessageNotification: Fetching initial unread count');
        const response = await fetch('http://localhost:5000/api/messages/unread', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch unread count');
        
        const data = await response.json();
        console.log('MessageNotification: Initial unread count', data);
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('MessageNotification: Error fetching unread count', error);
      }
    };
    
    fetchUnreadCount();
  }, [token]);
  
  // Listen for message events
  useEffect(() => {
    if (!socket || !user) return;
    
    console.log('MessageNotification: Setting up message listeners');
    
    // IMPORTANT: Only handle notifications through the 'new_message' event
    // Removed the duplicate handler for 'receive_message'
    const handleNotification = (data) => {
      console.log('MessageNotification: Notification received', data);
      if (data.receiverId === user.id) {
        console.log('MessageNotification: Incrementing unread count from notification');
        setUnreadCount(prev => prev + 1);
      }
    };
    
    socket.on('new_message', handleNotification);
    
    return () => {
      socket.off('new_message', handleNotification);
    };
  }, [socket, user]);
  
  // Function to clear unread count
  const clearUnreadCount = () => {
    console.log('MessageNotification: Clearing unread count');
    setUnreadCount(0);
  };
  
  // Function to manually increment (for testing)
  const incrementUnreadCount = () => {
    console.log('MessageNotification: Manually incrementing unread count');
    setUnreadCount(prev => prev + 1);
  };
  
  // Debug function for logs
  const getDebugInfo = () => {
    return {
      unreadCount,
      socketConnected: socket?.connected,
      userId: user?.id
    };
  };
  
  // Value to provide to consumers
  const value = {
    unreadCount,
    clearUnreadCount,
    incrementUnreadCount,
    getDebugInfo
  };
  
  return (
    <MessageNotificationContext.Provider value={value}>
      {children}
    </MessageNotificationContext.Provider>
  );
};

// Custom hook to use the context
export const useMessageNotifications = () => useContext(MessageNotificationContext);