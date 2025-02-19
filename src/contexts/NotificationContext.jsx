import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [friendRequests, setFriendRequests] = useState(0);
  const { token } = useAuth();

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/friends/pending',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setFriendRequests(response.data.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFriendRequests();
      // Fetch every minute to keep count updated
      const interval = setInterval(fetchFriendRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const clearFriendRequests = () => {
    setFriendRequests(0);
  };

  return (
    <NotificationContext.Provider value={{ friendRequests, clearFriendRequests, fetchFriendRequests }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);